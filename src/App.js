import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";
import { MODE_ID } from "./constants";
import { Mode } from "./utils/Mode";
import { SceneEvents } from "./utils/SceneEvents";

/**
 * App initialization and state storage class
 */
export class App {
  canvasId;
  canvas;
  engine;
  scene;
  camera;
  ground;
  selectedMode = MODE_ID.VIEW;
  selectedPoints = [];
  selectedPointsMarkingSpheres = [];
  selectedPointsMarkingSpheresMaterial;
  DRAW;
  EXTRUDE;
  MOVE;
  VIEW;
  VERTEX_EDIT;
  /**
   * Initialize app with essentials
   * @param {string} canvasId
   */
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.engine = new Engine(this.canvas);
    this.scene = new Scene(this.engine);
    window.onresize = () => this.engine.resize();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initModes();
    this.initGround();
    const sceneEvents = new SceneEvents(this.getInstance());
    sceneEvents.initSceneEvents();
  }

  /**
   * Get instance of the app
   * @returns {App}
   */
  getInstance() {
    return this;
  }

  /**
   * Initialize basic scene configurations
   */
  initScene() {
    // Clear scene background color
    this.scene.clearColor = new Color4(0, 0, 0, 0);
    // Fog effects for better visuals
    // this.scene.fogMode = Scene.FOGMODE_EXP2;
    // this.scene.fogColor = new Color3(225 / 255, 225 / 255, 225 / 255);
    // this.scene.fogDensity = 0.05;
  }

  /**
   * Initialize camera setup for app
   */
  initCamera() {
    this.camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      3,
      new Vector3(0, 0, 0),
      this.scene
    );

    // Min Rotation of camera longitudinally
    this.camera.lowerBetaLimit = 0.1;
    // Max Rotation of camera longitudinally
    this.camera.upperBetaLimit = (Math.PI / 2) * 0.9;
    // Min zoom-in radius limit
    this.camera.lowerRadiusLimit = 5;
    // Max zoom-out radius limit
    this.camera.upperRadiusLimit = 150;
    // Attach camera to canvas to begin its functionality
    this.camera.attachControl(this.canvas, true);
  }

  /**
   * Initialize basic light setup
   */
  initLights() {
    const hemisphericLight = new HemisphericLight(
      "light",
      new Vector3(0, 20, 0),
      this.scene
    );
    // Set color of light which is being casted
    hemisphericLight.diffuse = new Color3(230 / 255, 230 / 255, 230 / 255);
    hemisphericLight.intensity = 0.35;

    // Another light to bring vibrance to the scene
    const directionalLight = new DirectionalLight(
      "directionalLight",
      new Vector3(-1, -1, -1),
      this.scene
    );
    directionalLight.position = new Vector3(20, 20, 20);
  }

  /**
   * Initialize modes for the scene which sets up basic events and state management
   * of selected modes
   */
  initModes() {
    this.DRAW = new Mode(MODE_ID.DRAW);
    this.DRAW.onClick(this.drawMode, this.getInstance());

    this.EXTRUDE = new Mode(MODE_ID.EXTRUDE);
    this.EXTRUDE.onClick(this.extrudeMode, this.getInstance());

    this.MOVE = new Mode(MODE_ID.MOVE);
    this.MOVE.onClick(this.moveMode, this.getInstance());

    this.VERTEX_EDIT = new Mode(MODE_ID.VERTEX_EDIT);
    this.VERTEX_EDIT.onClick(this.vertexEditMode, this.getInstance());

    this.VIEW = new Mode(MODE_ID.VIEW);
    this.VIEW.onClick(this.viewMode, this.getInstance());

    this.DELETE = new Mode(MODE_ID.DELETE);
    this.DELETE.onClick(this.deleteMode, this.getInstance());
  }

  /**
   * Initialize a ground reference plane
   */
  initGround() {
    this.ground = MeshBuilder.CreateGround(
      "ground",
      { width: 1000, height: 1000 },
      this.scene
    );
  }

  /**
   * Callback for draw mode function, also sets the state of selectedMode
   * @param {*} ev
   * @param {*} appInstance
   */
  drawMode(ev, appInstance) {
    appInstance.selectedMode = MODE_ID.DRAW;
  }

  /**
   * Callback for rcytifr mode function, also sets the state of selectedMode
   * @param {*} ev
   * @param {*} appInstance
   */
  extrudeMode(ev, appInstance) {
    appInstance.selectedMode = MODE_ID.EXTRUDE;
  }

  /**
   * Callback for move mode function, also sets the state of selectedMode
   * @param {*} ev
   * @param {*} appInstance
   */
  moveMode(ev, appInstance) {
    appInstance.selectedMode = MODE_ID.MOVE;
  }

  /**
   * Callback for vertex edit mode function, also sets the state of selectedMode
   * @param {*} ev
   * @param {*} appInstance
   */
  vertexEditMode(ev, appInstance) {
    appInstance.selectedMode = MODE_ID.VERTEX_EDIT;
  }

  /**
   * Callback for view mode function, also sets the state of selectedMode
   * @param {*} ev
   * @param {*} appInstance
   */
  viewMode(ev, appInstance) {
    appInstance.selectedMode = MODE_ID.VIEW;
  }

  /**
   * Callback for delete mode function, also sets the state of selectedMode
   * @param {*} ev
   * @param {*} appInstance
   */
  deleteMode(ev, appInstance) {
    appInstance.selectedMode = MODE_ID.DELETE;
  }
}
