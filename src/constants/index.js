// IDs of mode buttons
export const MODE_ID = {
  DELETE: "delete",
  DRAW: "draw",
  EXTRUDE: "extrude",
  MOVE: "move",
  VIEW: "view",
  VERTEX_EDIT: "vertex-edit",
};

// Info text to show after click a mode
export const INFO_TEXT = {
  delete: "Left click to delete mesh",
  draw: "Left click to add points, right click to complete",
  extrude: "Click on shape to extrude (constant height of 0.5)",
  move: "Left click and drag on the extruded shape to move it",
  view: "Move using mouse, ctrl+click to pan",
  "vertex-edit": "Mouse over a vertex to select, click and drag to edit",
};

// Class applied to selected mode button
export const SELECTED_MODE_CLASS = "selected-mode";

// ID of mode-container
export const MODE_CONTAINER_ID = "modes";

// ID of canvas to render scene
export const CANVAS_ID = "renderCanvas";

// ID of info span
export const INFO_ID = "info";
