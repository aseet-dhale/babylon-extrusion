import { Color3, MeshBuilder, Vector3, VertexBuffer } from "@babylonjs/core";
import earcut from "earcut";

/**
 * Helper to get position when clicked on ground
 * @param {*} scene scene to get position from
 * @returns {Vector3|null}
 */
export function getGroundPosition(scene) {
  const pickinfo = scene.pick(
    scene.pointerX,
    scene.pointerY,
    // Predicate to only hit if mesh has id ground
    (mesh) => mesh.id === "ground"
  );
  if (pickinfo.hit) {
    return pickinfo.pickedPoint;
  }

  return null;
}

/**
 * Helper function to extract color from a mesh
 * @param {*} mesh mesh to extract color from
 * @returns {Color3}
 */
export function getColor3FromMesh(mesh) {
  const colorData = mesh.getVerticesData(VertexBuffer.ColorKind, true);
  return new Color3(colorData[0], colorData[1], colorData[2]);
}

/**
 * Helper to extrude polygon from a set of shapes
 * @param {Array<Vector3>} shape shape of the polygon
 * @param {*} scene scene where mesh is added
 * @param {Color3} color color of the added mesh
 * @returns {*} mesh of extruded polygon
 */
export function extrudePolygonMesh(shape, scene, color) {
  const createdPolygon = MeshBuilder.ExtrudePolygon(
    "extruded-polygon",
    {
      shape: shape,
      // Constant height of extruded polygon
      depth: 1,
      faceColors: new Array(shape.length).fill(color),
      updatable: true,
    },
    scene,
    earcut
  );

  // Set y poisition to 1 since extruded polygon has renders below plane
  createdPolygon.position.y = 1;
  // Update the vertices of the polygon
  createdPolygon.bakeCurrentTransformIntoVertices();
  return createdPolygon;
}

/**
 * Helper to extract shape from position vertex data
 * @param {*} pickedMesh
 * @returns {Array<Vector3>}
 */
export function getPolygonShapeFromGeometryPosition(pickedMesh) {
  const vertices = pickedMesh.getVerticesData(VertexBuffer.PositionKind);
  const shape = [];
  for (let i = 0; i < vertices.length / 3; i++) {
    shape.push(
      new Vector3(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2])
    );
  }
  return shape;
}

/**
 * Helper to convert shape to position vertex data
 * @param {Array<Vector3>} shape
 * @returns {Array<number>}
 */
export function getPositionFromShape(shape) {
  const position = [];
  for (let i = 0; i < shape.length; i++) {
    position.push(shape[i].x);
    position.push(shape[i].y);
    position.push(shape[i].z);
  }
  return position;
}
