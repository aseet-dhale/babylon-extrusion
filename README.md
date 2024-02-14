# babylon-extrusion

## Running the site

1. `npm install` to install dependencies
2. `npm start` to to start a local server

Look for the port show in terminal to access the site on localhost.

## Features

This app has basic functionality to create 3d polygons from 2d polygons.
Here are the list of supported modes (ordered alphabetically)

1. Delete Mode

   - Delete any existing mesh in the scene

2. Draw Mode

   - Start clicking on the scene to add points for the 2d polygon
   - After finished drawing right click to complete the shape

3. Extrude Mode

   - Click on the drawn 2d polygon to extrude it. The height of extrusion is a constant `0.5`.

4. Move Mode

   - Click on a 3d polygon and drag it in the scene to move it.

5. View Mode

   - A basic mode to move through out the scene
   - Scroll to zoom and ctrl + click to pan

6. Vertex Edit Mode

   - Hover over the vertices to start editing.
   - Click and drag on the vertices to change the shape of the object/mesh.
   - All the vertex of the mesh can be transformed except 1(as per my observations it is one of the vertex in the top surface of the polygon).
