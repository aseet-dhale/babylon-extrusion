import { Color3, MeshBuilder, Vector3, VertexBuffer } from "@babylonjs/core";
import earcut from "earcut";
import { MODE_ID } from "../constants";
import {
  extrudePolygonMesh,
  getColor3FromMesh,
  getGroundPosition,
  getPolygonShapeFromGeometryPosition,
  getPositionFromShape,
} from "../helpers";

/**
 * Utility class to control scene events
 */
export class SceneEvents {
  // Starting point of drag
  startingPoint = null;
  // Current point when drag ends
  current = null;
  pickedMesh = null;
  pickedVertexBoxMesh = null;
  constructor(app) {
    // Store a local copy of the app
    this.app = app;
  }

  /**
   * Add event listeners for the scene
   * 1. onPointerDown - fire action for draw,extrude,delete,view mode
   * 2. onPointerUp - fire action to reset class properties
   * 3. onPointerMove - fire action to move and edit vertex
   */
  initSceneEvents() {
    this.app.scene.onPointerDown = (event, pickInfo) => {
      // If picked mesh is not ground set the starting drag position
      if (pickInfo.hit && pickInfo.pickedMesh.id !== "ground") {
        if (pickInfo.pickedMesh) this.pickedMesh = pickInfo.pickedMesh;
        this.startingPoint = getGroundPosition(this.app.scene);
        if (this.startingPoint) {
          // Detach camera for drag mode
          setTimeout(() => this.app.camera.detachControl(this.app.canvas), 0);
        }
      }
      switch (this.app.selectedMode) {
        case MODE_ID.DRAW:
          this.drawMode(event, pickInfo);
          break;
        case MODE_ID.EXTRUDE:
          this.extrudeMode(event, pickInfo);
          break;
        case MODE_ID.DELETE:
          this.deleteMode(event, pickInfo);
          break;
        case MODE_ID.VIEW:
        default:
          break;
      }
    };

    this.app.scene.onPointerUp = (event, pickInfo) => {
      // Clean up events
      if (this.startingPoint) {
        this.app.camera.attachControl(this.app.canvas, true);
        this.startingPoint = null;
      }
      if (this.pickedVertexBoxMesh) {
        this.pickedVertexBoxMesh.dispose();
        this.pickedVertexBoxMesh = null;
      }
      // Remove points from ground if points are less than 2
      if (
        this.app.selectedPoints.length <= 2 &&
        this.app.selectedMode !== MODE_ID.DRAW
      ) {
        this.app.selectedPoints.length = 0;
        this.app.selectedPointsMarkingSpheres.forEach((point) =>
          point.dispose()
        );
        this.app.selectedPointsMarkingSpheres.length = 0;
      }
    };

    this.app.scene.onPointerMove = (event, pickInfo) => {
      this.current = getGroundPosition(this.app.scene);
      switch (this.app.selectedMode) {
        case MODE_ID.MOVE:
          this.moveMode(event, pickInfo);
          break;
        case MODE_ID.VERTEX_EDIT:
          this.vertexEditMode(event, pickInfo);
          break;
        default:
          break;
      }
    };
  }

  /**
   * Delete all selected mesh if they are not ground mesh
   * @param {*} event
   * @param {*} pickInfo
   */
  deleteMode(event, pickInfo) {
    if (pickInfo.hit && pickInfo.pickedMesh.id !== "ground") {
      pickInfo.pickedMesh.dispose();
    }
  }

  /**
   * Draw points of ground for a polygon shape
   * @param {*} event
   * @param {*} pickInfo
   */
  drawMode(event, pickInfo) {
    // On Left Click
    if (event.button === 0) {
      if (pickInfo.pickedPoint) {
        // Store state of clicked points
        this.app.selectedPoints.push(pickInfo.pickedPoint);
        const point = MeshBuilder.CreateSphere(
          "point",
          { diameter: 0.1 },
          this.app.scene
        );
        point.setAbsolutePosition(pickInfo.pickedPoint);
        // Store state of created marking spheres
        this.app.selectedPointsMarkingSpheres.push(point);
      }
    }
    // In Right Click
    if (event.button === 2) {
      // Clear picked points and create a polygon
      if (this.app.selectedPoints.length > 2) {
        const createdPolygon = MeshBuilder.CreatePolygon(
          "polygon",
          {
            shape: this.app.selectedPoints.map(
              (val) => new Vector3(val.x ?? 0, 0, val.z ?? 0)
            ),
            faceColors: new Array(this.app.selectedPoints.length).fill(
              Color3.Random()
            ),
          },
          this.app.scene,
          earcut
        );
        // Set a nominal very small +y axis position to avoid glitching with ground mesh
        createdPolygon.setAbsolutePosition(new Vector3(0, 0.0001, 0));
        // Reset selectedPoints state
        this.app.selectedPoints.length = 0;
        // Dispose all marking points
        this.app.selectedPointsMarkingSpheres.forEach((point) =>
          point.dispose()
        );
        // Reset selected marking points state
        this.app.selectedPointsMarkingSpheres.length = 0;
      }
    }
  }

  /**
   * Extruded a give polygon on click
   * @param {*} event
   * @param {*} pickInfo
   */
  extrudeMode(event, pickInfo) {
    const pickedMesh = pickInfo?.pickedMesh;
    if (pickedMesh && pickedMesh.id === "polygon") {
      // Get the random color assigned to 2d polygon
      const color = getColor3FromMesh(pickedMesh);
      // Get shape from vertex position data
      const shape = getPolygonShapeFromGeometryPosition(pickedMesh);
      // Extrude a new polygon mesh from shape with same color as 2d polygon
      extrudePolygonMesh(shape, this.app.scene, color);
      // Dispose 2d polygon
      pickedMesh.dispose();
    }
  }

  /**
   * Move the extruded polygon in 3d space
   * @param {*} event
   * @param {*} pickInfo
   * @returns
   */
  moveMode(event, pickInfo) {
    if (!this.startingPoint) return;
    if (!this.current) return;
    // Calculate diff based on startingPoint (dragStart) and current (dragEnd)
    // and move the position of the mesh with the diff
    const diff = this.current.subtract(this.startingPoint);
    if (this.pickedMesh) {
      this.pickedMesh.position.addInPlace(diff);
      this.pickedMesh.bakeCurrentTransformIntoVertices();
    }
    // Set new starting point as current
    this.startingPoint = this.current;
  }

  /**
   * Edit vertices of an extruded polygon
   * @param {*} event
   * @param {*} pickInfo
   * @returns {void}
   */
  vertexEditMode(event, pickInfo) {
    const scene = this.app.scene;
    // Select a point on scene and extract picked info
    const pick = scene.pick(scene.pointerX, scene.pointerY);
    let vertexIndex = null;
    let shape = null;
    // If hit is an extruded polygon then do process further
    if (pick.hit && pick.pickedMesh.name === "extruded-polygon") {
      // Set current picked mesh
      this.pickedMesh = pick.pickedMesh;
      // Get shape of vertex data for position
      shape = getPolygonShapeFromGeometryPosition(pick.pickedMesh);
      for (let i = 0; i < shape.length; i++) {
        if (
          shape[i].equals(pick.pickedPoint) ||
          // Snap to 0.1 distance from the vertex position
          shape[i].subtract(pick.pickedPoint).lengthSquared() < 0.1
        ) {
          vertexIndex = i;
          if (!this.pickedVertexBoxMesh) {
            // Create a visual cue box to show vertex
            this.pickedVertexBoxMesh = MeshBuilder.CreateBox(
              "vertex",
              {
                size: 0.1,
              },
              this.app.scene
            );
            // Update position of box based on selected vertex
            this.pickedVertexBoxMesh.setAbsolutePosition(shape[i]);
            this.pickedVertexBoxMesh.bakeCurrentTransformIntoVertices();
          }
          break;
        }
      }
    }
    if (pick.hit && pick.pickedMesh.name !== "extruded-polygon") {
      // Reset visual vertex cue box
      if (this.pickedVertexBoxMesh) {
        this.pickedVertexBoxMesh.dispose();
        this.pickedVertexBoxMesh = null;
      }
    }

    if (!this.startingPoint) return;
    if (!this.current) return;
    if (!this.pickedVertexBoxMesh) return;
    const diff = this.current.subtract(this.startingPoint);
    this.pickedVertexBoxMesh.position.addInPlace(diff);
    this.pickedVertexBoxMesh.bakeCurrentTransformIntoVertices();
    if (this.pickedMesh && vertexIndex) {
      // Not cloning the vertex mutates the Vector3 resulting in rasterized mesh
      const vertexPosition = shape[vertexIndex].clone();
      // For each shape addInPlace for all equal vertices
      shape.forEach((vector) => {
        if (vector.equals(vertexPosition)) {
          vector.addInPlace(diff);
        }
      });
      // Convert shape to position data for updation
      const position = getPositionFromShape(shape);
      // Set newly updated vertex data
      this.pickedMesh.setVerticesData(
        VertexBuffer.PositionKind,
        position,
        true
      );
      this.pickedMesh.bakeCurrentTransformIntoVertices();
    }
    // Reset drag start and drag end
    this.startingPoint = this.current;
  }
}
