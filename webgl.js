// Global vars
var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;

// Define the animation loop
var lastTime = Date.now();
var mainLoop = function (timestamp) {
    "use strict";
  
    // Get the time difference
    var now = Date.now();
    var deltaTime = now - lastTime;
    
    // Update
    // Draw
    
    // keep track of the current time
    lastTime = now;
    
    // Call animation again
    requestAnimationFrame(mainLoop);
}

// Launches everything
var begin = function () {
    "use strict";
    
    // Initialise
    var canvas = document.getElementById("playground");
    initGL(canvas);
    initShaders();
    initBuffers();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    // Draw
    drawScene();
    
    // Trigger the loop
    requestAnimationFrame(mainLoop);
}

function initBuffers() {
    "use strict";
    
    // Init triangle buffer and make current
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    
    // Assign vertes data to buffer
    var triVertices = [
    0.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triVertices), gl.STATIC_DRAW);
    
    // Set buffer properties
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;
    
    // Init triangle buffer and make current
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    
    // Assign vertes data to buffer
    var squVertices = [
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0, -1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(squVertices), gl.STATIC_DRAW);
    
    // Set buffer properties
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

var drawScene = function() {
    "use strict";
    
    // Set viewport
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    
    // Wipe canvas
    gl.clear(gl.COLOUR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // 45* fov
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    
    // Move to center of scene
    mat4.identity(mvMatrix);
    
    // Move to left
    mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
    
    // Use triangle as positions
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    // Copy matrix over to graphics card
    setMatrixUniforms();
    
    // DRAW!
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);
    
    // Move to right
    mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
    
    // Use triangle as positions
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    // Copy matrix over to graphics card
    setMatrixUniforms();
    
    // DRAW!
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

var gl;
var initGL = function(canvas) {
    "use strict";
    
    try {
        // Grab WebGL context
        gl = canvas.getContext("experimental-webgl");
        
        // Store width and height
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
    catch(e) {
        // LOL disregard amirite
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :(");
    }
}

var shaderProgram;
var initShaders = function() {
    "use strict";
  
    // Init fragment and vertex shaders
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");
    
    // Build shader program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    // Check shaders loaded
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
    }
    
    // Attach to gl
    gl.useProgram(shaderProgram);
    
    // Store vertex position attribute
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

// Gets shaders
function getShader(gl, id) {
    "use strict";
    
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
      return null;
    }
    
    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
      if (k.nodeType == 3)
          str += k.textContent;
      k = k.nextSibling;
    }
    
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
      return null;
    }
    
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }
    
    return shader;
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

// Model-view and projection matricies
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

// GO!
begin();