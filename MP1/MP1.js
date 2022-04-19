/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Catherine Cheng <wanning3@illinois.edu>
 * 
 * Updated Spring 2021 to use WebGL 2.0 and GLSL 3.00
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The vertex array object for the triangle */
var vertexArrayObject;

/** @global The rotation angle of our triangle */
var rotAngle = 0;

/**@global A switch determine whether the model part should rotate in a counter direction */
var counterRotate = false;

/**@global The scaling factor of our model */
var scaleFactor = 0.1;

/**@global A switch determine whether the model should keep turning larger */
var turnLarger = false;

/**@global The translation value of our model */
var translate = 0;

/**@global A switch determine whether the model should keep moving right*/
var moveRight = false;

/** @global The ModelView matrix contains any modeling and viewing transformations */
var modelViewMatrix = glMatrix.mat4.create();

/** @global Records time last frame was rendered */
var previousTime = 0;


/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}


/**
 * Loads a shader.
 * Retrieves the source code from the HTML document and compiles it.
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
    
  var shaderSource = shaderScript.text;
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}


/**
 * Set up the fragment and vertex shaders.
 */
function setupShaders() {
  // Compile the shaders' source code.
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  // Link the shaders together into a program.
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // We only use one shader program for this example, so we can just bind
  // it as the current program here.
  gl.useProgram(shaderProgram);
    
  // Query the index of each attribute in the list of attributes maintained
  // by the GPU. 
  shaderProgram.vertexPositionAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexColorAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexColor");
    
  //Get the index of the Uniform variable as well
  shaderProgram.modelViewMatrixUniform =
    gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
}


/**
 * Set up the buffers to hold the triangle's vertex positions and colors.
 */
function setupBuffersIllinois(deltaX) {
    
  // Create the vertex array object, which holds the list of attributes for
  // the triangle.
  vertexArrayObject = gl.createVertexArray();
  gl.bindVertexArray(vertexArrayObject); 

  // Create a buffer for positions, and bind it to the vertex array object.
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

  // Define a triangle in clip coordinates.
  var vertices1 = [
        -0.6 + deltaX, 1.0, 0.0, //1
        -0.6 + deltaX, 0.6, 0.0, //2
        -0.2 + deltaX, 0.6, 0.0, //3

        -0.6 + deltaX, 1.0, 0.0,
        -0.2 + deltaX, 0.6, 0.0,
        0.6 + deltaX, 1.0, 0.0,

        -0.2 + deltaX, 0.6, 0.0,
        0.2 + deltaX, 0.6, 0.0,
        0.6 + deltaX, 1.0, 0.0,

        -0.2 + deltaX, 0.6, 0.0,
        0.2 + deltaX, -0.6, 0.0,
        0.2 + deltaX, 0.6, 0.0,

        -0.2 + deltaX, 0.6, 0.0,
        -0.2 + deltaX, -0.6, 0.0,
        0.2 + deltaX, -0.6, 0.0,

        -0.2 + deltaX, -0.6, 0.0,
        0.6 + deltaX, -1.0, 0.0,
        0.2 + deltaX, -0.6, 0.0,

        -0.2 + deltaX, -0.6, 0.0,
        -0.6 + deltaX, -1.0, 0.0,
        0.6 + deltaX, -1.0, 0.0,

        -0.2 + deltaX, -0.6, 0.0, //4
        -0.6 + deltaX, -0.6, 0.0, //5
        -0.6 + deltaX, -1.0, 0.0, //6

        0.6 + deltaX, -1.0, 0.0, //7
        0.6 + deltaX, -0.6, 0.0, //8
        0.2 + deltaX, -0.6, 0.0, //9

        0.2 + deltaX, 0.6, 0.0, //10
        0.6 + deltaX, 0.6, 0.0, //11
        0.6 + deltaX, 1.0, 0.0 //12
  ];
  // Populate the buffer with the position data.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices1), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 30;

  // Binds the buffer that we just made to the vertex position attribute.
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  // Do the same steps for the color buffer.
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,

        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0,
        0.74, 0.392, 0.2078, 1.0
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 30;  
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                         vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
   // Enable each attribute we are using in the VAO.  
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
  // Unbind the vertex array object to be safe.
  gl.bindVertexArray(null);
}


/**
 * Draws a frame to the screen.
 */
function draw() {
  // Transform the clip coordinates so the render fills the canvas dimensions.
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  // Clear the screen.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Use the vertex array object that we set up.
  gl.bindVertexArray(vertexArrayObject);
    
  // Send the ModelView matrix with our transformations to the vertex shader.
  gl.uniformMatrix4fv(shaderProgram.modelViewMatrixUniform,
                      false, modelViewMatrix);
    
  // Render the triangle. 
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
  
  // Unbind the vertex array object to be safe.
  gl.bindVertexArray(null);
}


/**
 * Animates the triangle by updating the ModelView matrix with a rotation
 * each frame.
 */
 function animateIllinois(currentTime) {
  // Read the speed slider from the web page.
  var speed = document.getElementById("speed").value;

  // Convert the time to seconds.
  currentTime *= 0.001;
  // Subtract the previous time from the current time.
  var deltaTime = currentTime - previousTime;
  // Remember the current time for the next frame.
  previousTime = currentTime;
     
  // Update geometry to rotate 'speed' degrees per second.
  rotAngle += speed * deltaTime;
  if (rotAngle > 360.0)
      rotAngle = 0.0;

  // Update geometry to change the scale by the factor of 'speed' / 200 per second.
  // The model will turn larger until the scale factor reaches 1 and then turn smaller until the factor
  // reaches 0.1 and then repeat the steps.
  if (turnLarger) {
    scaleFactor += speed * deltaTime / 200;
  } else {
    scaleFactor -= speed * deltaTime / 200;
  }
  if (scaleFactor > 1) {
      turnLarger = false;
  }
  if (scaleFactor < 0.1) {
      turnLarger = true;
  }

  // Applying affine transformation to make the model rotate by X and Z axis and 
  // change by the calculated scale factor
  var xRotate = glMatrix.mat4.create();
  var zRotate = glMatrix.mat4.create();
  var scaleVec = glMatrix.vec3.create();
  var scale = glMatrix.mat4.create();
  glMatrix.vec3.set(scaleVec, scaleFactor, scaleFactor, 0.0);
  glMatrix.mat4.fromScaling(scale, scaleVec);
  glMatrix.mat4.fromXRotation(xRotate, degToRad(rotAngle));
  glMatrix.mat4.fromZRotation(zRotate, degToRad(rotAngle));
  glMatrix.mat4.multiply(zRotate, zRotate, xRotate);
  glMatrix.mat4.multiply(modelViewMatrix, zRotate, scale);

  // Update the transformation value by 'speed' / 120 per second.
  // The model whould move back and forth on X axis between -1 and 1
  if (translate > 1) {
    moveRight = false;
  }
  if (translate < -1) {
    moveRight = true;
  }
  if (moveRight) {
    translate += speed * deltaTime / 50;
  } else {
    translate -= speed * deltaTime / 50;
  }
  setupBuffersIllinois(translate);     

  // Draw the frame.
  draw();
  
  // Animate the next frame. The animate function is passed the current time in
  // milliseconds.
  if (document.getElementById("I").checked) {
    requestAnimationFrame(animateIllinois); 
  } else {
    rotAngle = 0;
    scaleFactor = 0.1;
    translate = 0;
    modelViewMatrix = glMatrix.mat4.create();
    requestAnimationFrame(animateCustom);
  }
}

function animateCustom(currentTime) {
  // Read the speed slider from the web page.
  var speed = document.getElementById("speed").value;

  // Convert the time to seconds.
  currentTime *= 0.001;
  // Subtract the previous time from the current time.
  var deltaTime = currentTime - previousTime;
  // Remember the current time for the next frame.
  previousTime = currentTime;
     
  // Update geometry to rotate 'speed' degrees per second.
  if (counterRotate) {
    rotAngle += speed * deltaTime;
  } else {
    rotAngle -= speed * deltaTime;
  }
  
  if (rotAngle > 360.0)
      rotAngle = 0.0;
  if (rotAngle < 0) 
      rotAngle = 360;

  if (rotAngle > 20 && rotAngle < 90) {
    counterRotate = false;
  }
  if (rotAngle < 330 && rotAngle > 90) {
    counterRotate = true;
  }

  // Update the translation value by 'speed' / 120 per second.
  // The model whould move back and forth on X axis between -1 and 1
  if (translate > 1) {
    moveRight = false;
  }
  if (translate < -1) {
    moveRight = true;
  }
  if (moveRight) {
    translate += speed * deltaTime / 120;
  } else {
  translate -= speed * deltaTime / 120;
  }

  var vTranslate = glMatrix.vec3.create();
  glMatrix.vec3.set(vTranslate, translate, 0.0, 0.0);
  glMatrix.mat4.fromTranslation(modelViewMatrix, vTranslate);
  setupBuffersCustom(degToRad(rotAngle));     

  // Draw the frame.
  draw();
  
  // Animate the next frame. The animate function is passed the current time in
  // milliseconds.
  if (document.getElementById("I").checked) {
    rotAngle = 0;
    scaleFactor = 0.1;
    translate = 0;
    modelViewMatrix = glMatrix.mat4.create();
    requestAnimationFrame(animateIllinois); 
  } else {
    requestAnimationFrame(animateCustom);
  }
}

function setupBuffersCustom(deltaX) {
  // Create the vertex array object, which holds the list of attributes for
  // the triangle.
  vertexArrayObject = gl.createVertexArray();
  gl.bindVertexArray(vertexArrayObject); 

  // Create a buffer for positions, and bind it to the vertex array object.
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

  // Calculate the counter direction of the rotation angle.
  var deltaY = degToRad(360) - deltaX;

  // Define a triangle in clip coordinates.
  var vertices = [
        0.1, 0.75, 0.0, //1
        -0.1, 0.75, 0.0, //2
        0.1, 0.55, 0.0, //4

        -0.1, 0.55, 0.0, //3
        0.1, 0.55, 0.0, //4
        -0.1, 0.75, 0.0, //2

        -0.1, 0.55, 0.0, //3
        0.1, 0.25, 0.0, //9
        0.1, 0.55, 0.0, //4

        -0.1, 0.55, 0.0, //3
        -0.1, 0.25, 0.0, //10
        0.1, 0.25, 0.0, //9

        -0.1, 0.25, 0.0, //10
        0.1, 0.05, 0.0, //12
        0.1, 0.25, 0.0, //9

        -0.1, 0.25, 0.0, //10
        -0.1, 0.05, 0.0, //11
        0.1, 0.05, 0.0, //12

        0.1, 0.25, 0.0, //9
        0.1, 0.05, 0.0, //12
        0.4, 0.25, 0.0, //13

        -0.4, 0.25, 0.0, //15
        -0.1, 0.05, 0.0, //11
        -0.1, 0.25, 0.0, //10

        -0.1, 0.05, 0.0, //11
        0.1, -0.25, 0.0, //5
        0.1, 0.05, 0.0, //12

        -0.1, -0.25, 0.0, //6
        0.1, -0.25, 0.0, //5
        -0.1, 0.05, 0.0, //11

        -0.1*Math.cos(deltaX)+0.75*Math.sin(deltaX), -0.1*Math.sin(deltaX)-0.75*Math.cos(deltaX), 0.0, //7
        0.1*Math.cos(deltaX)+0.75*Math.sin(deltaX), 0.1*Math.sin(deltaX)-0.75*Math.cos(deltaX), 0.0, //8
        -0.1*Math.cos(deltaX)+0.25*Math.sin(deltaX), -0.1*Math.sin(deltaX)-0.25*Math.cos(deltaX), 0.0, //6

        -0.1*Math.cos(deltaX)+0.25*Math.sin(deltaX), -0.1*Math.sin(deltaX)-0.25*Math.cos(deltaX), 0.0, //6
        0.1*Math.cos(deltaX)+0.75*Math.sin(deltaX), 0.1*Math.sin(deltaX)-0.75*Math.cos(deltaX), 0.0, //8
        0.1*Math.cos(deltaX)+0.25*Math.sin(deltaX), 0.1*Math.sin(deltaX)-0.25*Math.cos(deltaX), 0.0, //6

        -0.1*Math.cos(deltaY)+0.75*Math.sin(deltaY), -0.1*Math.sin(deltaY)-0.75*Math.cos(deltaY), 0.0, //7
        0.1*Math.cos(deltaY)+0.75*Math.sin(deltaY), 0.1*Math.sin(deltaY)-0.75*Math.cos(deltaY), 0.0, //8
        -0.1*Math.cos(deltaY)+0.25*Math.sin(deltaY), -0.1*Math.sin(deltaY)-0.25*Math.cos(deltaY), 0.0, //6

        -0.1*Math.cos(deltaY)+0.25*Math.sin(deltaY), -0.1*Math.sin(deltaY)-0.25*Math.cos(deltaY), 0.0, //6
        0.1*Math.cos(deltaY)+0.75*Math.sin(deltaY), 0.1*Math.sin(deltaY)-0.75*Math.cos(deltaY), 0.0, //8
        0.1*Math.cos(deltaY)+0.25*Math.sin(deltaY), 0.1*Math.sin(deltaY)-0.25*Math.cos(deltaY), 0.0, //6

        2, -0.75, 0.0,
        -2, -0.75, 0.0,
        2, -0.77, 0.0,

        2, -0.77, 0.0,
        -2, -0.75, 0.0,
        -2, -0.77, 0.0
  ];
  // Populate the buffer with the position data.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 48;

  // Binds the buffer that we just made to the vertex position attribute.
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  // Do the same steps for the color buffer.
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [
        1.0, 0.9294, 0.8353, 1.0,
        1.0, 0.9294, 0.8353, 1.0,
        1.0, 0.9294, 0.8353, 1.0,

        1.0, 0.9294, 0.8353, 1.0,
        1.0, 0.9294, 0.8353, 1.0,
        1.0, 0.9294, 0.8353, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,
        0.235, 0.356, 0.474, 1.0,

        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,

        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,

    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 30;  
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                         vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
   // Enable each attribute we are using in the VAO.  
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    
  // Unbind the vertex array object to be safe.
  gl.bindVertexArray(null);
}

/**
 * Startup function called from html code to start the program.
 */
 function startup() {
  console.log("Starting animation...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  gl.enable(gl.DEPTH_TEST);
  setupShaders(); 
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  if (document.getElementById("I").checked) {
    setupBuffersIllinois()
    requestAnimationFrame(animateIllinois); 
  } else {
    setupBuffersCustom();
    requestAnimationFrame(animateCustom);
  }
}