/**
 * @file Terrain.js - A simple 3D terrain model for WebGL
 * @author Ian Rudnick <itr2@illinois.edu>
 * @brief Starter code for CS 418 MP2 at the University of Illinois at
 * Urbana-Champaign.
 * 
 * Updated Spring 2021 for WebGL 2.0/GLSL 3.00 ES.
 * 
 * You'll need to implement the following functions:
 * setVertex(v, i) - convenient vertex access for 1-D array
 * getVertex(v, i) - convenient vertex access for 1-D array
 * generateTriangles() - generate a flat grid of triangles
 * shapeTerrain() - shape the grid into more interesting terrain
 * calculateNormals() - calculate normals after warping terrain
 * 
 * Good luck! Come to office hours if you get stuck!
 */

class Terrain {   
    /**
     * Initializes the members of the Terrain object.
     * @param {number} div Number of triangles along the x-axis and y-axis.
     * @param {number} minX Minimum X coordinate value.
     * @param {number} maxX Maximum X coordinate value.
     * @param {number} minY Minimum Y coordinate value.
     * @param {number} maxY Maximum Y coordinate value.
     */
    constructor(div, minX, maxX, minY, maxY) {
        this.div = div;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
        
        // Allocate the vertex array
        this.positionData = [];
        // Allocate the normal array.
        this.normalData = [];
        // Allocate the triangle array.
        this.faceData = [];
        // Allocate an array for edges so we can draw a wireframe.
        this.edgeData = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        this.generateLines();
        console.log("Terrain: Generated lines");

        this.shapeTerrain();
        console.log("Terrain: Sculpted terrain");

        this.calculateNormals();
        console.log("Terrain: Generated normals");

        // You can use this function for debugging your buffers:
        // this.printBuffers();
    }
    

    //-------------------------------------------------------------------------
    // Vertex access and triangle generation - your code goes here!
    /**
     * Set the x,y,z coords of the ith vertex
     * @param {Object} v An array of length 3 holding the x,y,z coordinates.
     * @param {number} i The index of the vertex to set.
     */
    setVertex(v, i) {
        // MP2: Implement this function!
        this.positionData[i*3] = v[0];
        this.positionData[i*3 + 1] = v[1];
        this.positionData[i*3 + 2] = v[2];
    }
    

    /**
     * Returns the x,y,z coords of the ith vertex.
     * @param {Object} v An array of length 3 to hold the x,y,z coordinates.
     * @param {number} i The index of the vertex to get.
     */
    getVertex(v, i) {
        // MP2: Implement this function!
        v[0]=this.positionData[i*3];
        v[1]=this.positionData[i*3 + 1];
        v[2]=this.positionData[i*3 + 2];
    }


    /**
     * This function does nothing.
     */    
    generateTriangles() {
        // MP2: Implement the rest of this function!

        // We'll need these to set up the WebGL buffers.
        var deltaX=(this.maxX-this.minX)/this.div;
        var deltaY=(this.maxY-this.minY)/this.div;
        
        for(var i=0;i<=this.div;i++) {
            for(var j=0;j<=this.div;j++) { 
                this.positionData.push(this.minX+deltaX*j);
                this.positionData.push(this.minY+deltaY*i);
                this.positionData.push(0);

                this.normalData.push(0);
                this.normalData.push(0);
                this.normalData.push(0);
            }
        }

        for (var i = 0; i < this.div; i++) {
            for (var j = 0; j < this.div; j++) {
                this.faceData.push(i*(this.div+1) + j);
                this.faceData.push(i*(this.div+1) + j + 1);
                this.faceData.push(i*(this.div+1) + j + this.div + 1);
                this.faceData.push(i*(this.div+1) + j + 1);
                this.faceData.push(i*(this.div+1) + j + this.div + 2);
                this.faceData.push(i*(this.div+1) + j + this.div + 1);
            }
        }
        this.numVertices = this.positionData.length/3;
        this.numFaces = this.faceData.length/3;
    }


    /**
     * This function does nothing.
     */
    shapeTerrain() {
        // MP2: Implement this function!
        for (var it =0; it < 100; it++) {
            var point = glMatrix.vec3.create();
            point[0] = this.minX + Math.random() * (this.maxX - this.minX);
            point[1] = this.minY + Math.random() * (this.maxY - this.minY);
    
            var randomNormal = glMatrix.vec3.create();
            glMatrix.vec2.random(randomNormal);
            var h = 0;
            var delta = 0.010;
    
            for (var i = 0; i < this.numVertices; i++) {
                var vertex = glMatrix.vec3.create();
                this.getVertex(vertex, i);
                var result = glMatrix.vec3.create();
                glMatrix.vec3.sub(result, vertex, point);
                if (glMatrix.vec3.dot(result, randomNormal) >= 0) {
                    vertex[2] += delta;
                } else {
                    vertex[2] -= delta;
                }
                delta = delta / Math.pow(2, h);
                this.setVertex(vertex, i);
            }
        }
    }


    /**
     * This function does nothing.
     */
    calculateNormals() {
        // MP2: Implement this function!
        for (var i = 0; i < this.numFaces; i++) {
            var vertexIndex = [0, 0, 0];
            vertexIndex[0] = this.faceData[i*3];
            vertexIndex[1] = this.faceData[i*3+1];
            vertexIndex[2] = this.faceData[i*3+2];
            var v0 = glMatrix.vec3.create();
            var v1 = glMatrix.vec3.create();
            var v2 = glMatrix.vec3.create();
            var normal = glMatrix.vec3.create();
            this.getVertex(v0, vertexIndex[0]);
            this.getVertex(v1, vertexIndex[1]);
            this.getVertex(v2, vertexIndex[2]);
            glMatrix.vec3.sub(v1, v1, v0);
            glMatrix.vec3.sub(v2, v2, v0);
            glMatrix.vec3.cross(normal, v1, v2);
            for (var j = 0; j < 3; j++) {
                this.normalData[3*vertexIndex[j]] += normal[0]/2;
                this.normalData[3*vertexIndex[j]+1] += normal[1]/2;
                this.normalData[3*vertexIndex[j]+2] += normal[2]/2;
            }
        }
        for (var v = 0; v < this.numVertices; v++) {
            var normal = glMatrix.vec3.fromValues(this.normalData[3*v], this.normalData[3*v+1], this.normalData[3*v+2]);
            glMatrix.vec3.normalize(normal, normal);
            this.normalData[3*v] = normal[0];
            this.normalData[3*v+1] = normal[1];
            this.normalData[3*v+2] = normal[2];
        }
    }


    //-------------------------------------------------------------------------
    // Setup code (run once)
    /**
     * Generates line data from the faces in faceData for wireframe rendering.
     */
    generateLines() {
        for (var f = 0; f < this.faceData.length/3; f++) {
            // Calculate index of the face
            var fid = f*3;
            this.edgeData.push(this.faceData[fid]);
            this.edgeData.push(this.faceData[fid+1]);
            
            this.edgeData.push(this.faceData[fid+1]);
            this.edgeData.push(this.faceData[fid+2]);
            
            this.edgeData.push(this.faceData[fid+2]);
            this.edgeData.push(this.faceData[fid]);
        }
    }


    /**
     * Sets up the WebGL buffers and vertex array object.
     * @param {object} shaderProgram The shader program to link the buffers to.
     */
    setupBuffers(shaderProgram) {
        // Create and bind the vertex array object.
        this.vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArrayObject);

        // Create the position buffer and load it with the position data.
        this.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positionData),
                      gl.STATIC_DRAW);
        this.vertexPositionBuffer.itemSize = 3;
        this.vertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexPositionBuffer.numItems, " vertices.");

        // Link the position buffer to the attribute in the shader program.
        gl.vertexAttribPointer(shaderProgram.locations.vertexPosition,
                               this.vertexPositionBuffer.itemSize, gl.FLOAT, 
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexPosition);
    
        // Specify normals to be able to do lighting calculations
        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalData),
                      gl.STATIC_DRAW);
        this.vertexNormalBuffer.itemSize = 3;
        this.vertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexNormalBuffer.numItems, " normals.");

        // Link the normal buffer to the attribute in the shader program.
        gl.vertexAttribPointer(shaderProgram.locations.vertexNormal,
                               this.vertexNormalBuffer.itemSize, gl.FLOAT, 
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexNormal);
    
        // Set up the buffer of indices that tells WebGL which vertices are
        // part of which triangles.
        this.triangleIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faceData),
                      gl.STATIC_DRAW);
        this.triangleIndexBuffer.itemSize = 1;
        this.triangleIndexBuffer.numItems = this.faceData.length;
        console.log("Loaded ", this.triangleIndexBuffer.numItems, " triangles.");
    
        // Set up the index buffer for drawing edges.
        this.edgeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.edgeData),
                      gl.STATIC_DRAW);
        this.edgeIndexBuffer.itemSize = 1;
        this.edgeIndexBuffer.numItems = this.edgeData.length;
        
        // Unbind everything; we want to bind the correct element buffer and
        // VAO when we want to draw stuff
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    

    //-------------------------------------------------------------------------
    // Rendering functions (run every frame in draw())
    /**
     * Renders the terrain to the screen as triangles.
     */
    drawTriangles() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.triangleIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);
    }
    

    /**
     * Renders the terrain to the screen as edges, wireframe style.
     */
    drawEdges() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.drawElements(gl.LINES, this.edgeIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);   
    }


    //-------------------------------------------------------------------------
    // Debugging
    /**
     * Prints the contents of the buffers to the console for debugging.
     */
    printBuffers() {
        for (var i = 0; i < this.numVertices; i++) {
            console.log("v ", this.positionData[i*3], " ", 
                              this.positionData[i*3 + 1], " ",
                              this.positionData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numVertices; i++) {
            console.log("n ", this.normalData[i*3], " ", 
                              this.normalData[i*3 + 1], " ",
                              this.normalData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numFaces; i++) {
            console.log("f ", this.faceData[i*3], " ", 
                              this.faceData[i*3 + 1], " ",
                              this.faceData[i*3 + 2], " ");
        }  
    }

    getMaxElevation() {
        this.maxElevation = -9999;
        for (var i = 0; i < this.numVertices; i++) {
            var vertex = glMatrix.vec3.create();
            this.getVertex(vertex, i);
            var elevation = vertex[2];
            if (elevation > this.maxElevation) {
                this.maxElevation = elevation;
            }
        }
        return this.maxElevation;
    }

    getMinElevation() {
        this.minElevation = 9999;
        for (var i = 0; i < this.numVertices; i++) {
            var vertex = glMatrix.vec3.create();
            this.getVertex(vertex, i);
            var elevation = vertex[2];
            if (elevation < this.minElevation) {
                this.minElevation = elevation;
            }
        }
        return this.minElevation;
    }

} // class Terrain
