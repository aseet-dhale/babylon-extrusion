import { App } from "./App";
import { CANVAS_ID } from "./constants";

// Create an instance of APP
const app = new App(CANVAS_ID);
app.engine.runRenderLoop(() => {
  app.scene.render();
});
