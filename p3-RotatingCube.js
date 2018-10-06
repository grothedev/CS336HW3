//
// Colored rotating cube. Illustrates perspective projection.
// See definition of view and projection matrices below.
// See animation loop for transformations.
//

// Creates data for vertices, colors, and normal vectors for
// a unit cube.  Return value is an object with three attributes
// vertices, colors, and normals, each referring to a Float32Array.
function makeCube()
{
	  // vertices of cube
	var rawVertices = new Float32Array([
	-0.5, -0.5, 0.5,
	0.5, -0.5, 0.5,
	0.5, 0.5, 0.5,
	-0.5, 0.5, 0.5,
	-0.5, -0.5, -0.5,
	0.5, -0.5, -0.5,
	0.5, 0.5, -0.5,
	-0.5, 0.5, -0.5]);

	var rawColors = new Float32Array([
//	 1.0, 0.0, 0.0, 1.0,  // red
//	  1.0, 0.0, 0.0, 1.0,  // red
//	  1.0, 0.0, 0.0, 1.0,  // red
//	  1.0, 0.0, 0.0, 1.0,  // red
//	  1.0, 0.0, 0.0, 1.0,  // red
//	  1.0, 0.0, 0.0, 1.0,  // red

0.4, 0.4, 1.0, 1.0,  // Z blue
1.0, 0.4, 0.4, 1.0,  // X red
0.0, 0.0, 0.7, 1.0,  // -Z dk blue
0.7, 0.0, 0.0, 1.0,  // -X dk red
0.4, 1.0, 0.4, 1.0,  // Y green
0.0, 0.7, 0.0, 1.0,  // -Y dk green

	// 1.0, 0.0, 0.0, 1.0,  // red
	// 0.0, 1.0, 0.0, 1.0,  // green
	// 0.0, 0.0, 1.0, 1.0,  // blue
	// 1.0, 1.0, 0.0, 1.0,  // yellow
	// 1.0, 0.0, 1.0, 1.0,  // magenta
	// 0.0, 1.0, 1.0, 1.0,  // cyan
	]);

	var rawNormals = new Float32Array([
	0, 0, 1,
	1, 0, 0,
	0, 0, -1,
	-1, 0, 0,
	0, 1, 0,
	0, -1, 0 ]);

	var indices = new Uint16Array([
	0, 1, 2, 0, 2, 3,  // z face
	1, 5, 6, 1, 6, 2,  // +x face
	5, 4, 7, 5, 7, 6,  // -z face
	4, 0, 3, 4, 3, 7,  // -x face
	3, 2, 6, 3, 6, 7,  // + y face
	4, 5, 1, 4, 1, 0   // -y face
	]);

	var verticesArray = [];
	var colorsArray = [];
	var normalsArray = [];
	for (var i = 0; i < 36; ++i)
	{
		// for each of the 36 vertices...
		var face = Math.floor(i / 6);
		var index = indices[i];

		// (x, y, z): three numbers for each point
		for (var j = 0; j < 3; ++j)
		{
			verticesArray.push(rawVertices[3 * index + j]);
		}

		// (r, g, b, a): four numbers for each point
		for (var j = 0; j < 4; ++j)
		{
			colorsArray.push(rawColors[4 * face + j]);
		}

		// three numbers for each point
		for (var j = 0; j < 3; ++j)
		{
			normalsArray.push(rawNormals[3 * face + j]);
		}
	}

	return {
		vertices: new Float32Array(verticesArray),
		colors: new Float32Array(colorsArray),
		normals: new Float32Array(normalsArray)
	};
};


var axisVertices = new Float32Array([
0.0, 0.0, 0.0,
1.5, 0.0, 0.0,
0.0, 0.0, 0.0,
0.0, 1.5, 0.0,
0.0, 0.0, 0.0,
0.0, 0.0, 1.5]);

var axisColors = new Float32Array([
1.0, 0.0, 0.0, 1.0,
1.0, 0.0, 0.0, 1.0,
0.0, 1.0, 0.0, 1.0,
0.0, 1.0, 0.0, 1.0,
0.0, 0.0, 1.0, 1.0,
0.0, 0.0, 1.0, 1.0]);

var rVertices = new Float32Array([
	0, -3, 0,
	0, 3, 0
]);

var rColors = new Float32Array([
	0, 0, 0, 1,
	0, 0, 0, 1
]);

// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexColorBuffer;
var indexBuffer;
var axisBuffer;
var axisColorBuffer;
var rBuffer; //rotation axis
var rColorBuffer; //rotation axis

// handle to the compiled shader program on the GPU
var shader;

// transformation matrices
var model = new Matrix4();

//view matrix
//One strategy is to identify a transformation to our camera frame,
//then invert it.  Here we use the inverse of
//rotate(30, 0, 1, 0) * rotateX(-45) * Translate(0, 0, 5)
//var view = new Matrix4().translate(0, 0, -5).rotate(45, 1, 0, 0).rotate(-30, 0, 1, 0);

//Alternatively, use the LookAt function, specifying the view (eye) point,
//a point at which to look, and a direction for "up".
//Approximate view point for the above is (1.77, 3.54, 3.06)
var view = new Matrix4().setLookAt(
		1.77, 3.54, 3.06,   // eye
		0, 0, 0,            // at - looking at the origin
		0, 1, 0);           // up vector - y axis


//Here use aspect ratio 3/2 corresponding to canvas size 600 x 400,
// and a 30 degree field of view
var projection = new Matrix4().setPerspective(30, 1.5, .1, 6);

//Or, here is the same perspective projection, using the Frustum function
//a 30 degree field of view with near plane at 4 corresponds
//view plane height of  4 * tan(15) = 1.07
//var projection = new Matrix4().setFrustum(-1.5 * 1.07, 1.5 * 1.07, -1.07, 1.07, 4, 6);

var axis = [0, 1, 0];
var theta = 0; //pitch
var phi = 0; //head

var paused = false;


//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
if (event.which == null) {
 return String.fromCharCode(event.keyCode) // IE
} else if (event.which!=0 && event.charCode!=0) {
 return String.fromCharCode(event.which)   // the rest
} else {
 return null // special key
}
}

//handler for key press events will choose which axis to
// rotate around
function handleKeyPress(event)
{
	var ch = getChar(event);
	switch(ch)
	{
	// rotation controlsew Vector4(0, 1, 0, 0);ew Veew Vector4(0, 1, 0, 0);ew Vector4(0, 1, 0, 0);ew Vector4(0, 1, 0, 0);ew Vector4(0, 1, 0, 0);ew Vector4(0, 1, 0, 0);ew Vector4(0, 1, 0, 0);ew Vector4(0, 1, 0, 0);ctor4(0, 1, 0, 0);
	case 'p': //increase pitch 5degrees
		theta += 5;
		break;
	case 'P': //decrease pitch
		theta -= 5;
		break;
	case 'h': //increase head
		phi += 5;
		break;
	case 'H': //decrease head
		phi -= 5;
		break;
	}
	updateAxis();
}

function updateAxis(){
	//deg to rad
	let tr = theta * Math.PI / 180;
	let pr = phi * Math.PI / 180;
	let l = Math.sin(tr);
	axis[0] = l * Math.sin(pr);
	axis[1] = Math.cos(tr);
	axis[2] = l * Math.cos(pr);

	rVertices = new Float32Array([
		-1 * axis[0], -1 * axis[1], -1 * axis[2],
		axis[0], axis[1], axis[2]
	]);
}

// code to actually render our geometry
function draw()
{
  // clear the framebuffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

  // bind the shader
  gl.useProgram(shader);

  // get the index for the a_Position attribute defined in the vertex shader
  var positionIndex = gl.getAttribLocation(shader, 'a_Position');
  if (positionIndex < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  var colorIndex = gl.getAttribLocation(shader, 'a_Color');
  if (colorIndex < 0) {
	    console.log('Failed to get the storage location of a_');
	    return;
	  }

  // "enable" the a_position attribute
  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorIndex);

  // bind buffers for points
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set uniform in shader for projection * view * model transformation
  var transform = new Matrix4().multiply(projection).multiply(view).multiply(model);
  var transformLoc = gl.getUniformLocation(shader, "transform");
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);

  gl.drawArrays(gl.TRIANGLES, 0, 36);

  // draw axes (not transformed by model transformation)
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set transformation to projection * view only
  transform = new Matrix4().multiply(projection).multiply(view);
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);

  // draw axes
  gl.drawArrays(gl.LINES, 0, 6);

	//draw r
  gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
  gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, rColorBuffer);
  gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // set transformation to projection * view only
  transform = new Matrix4().multiply(projection).multiply(view);
  gl.uniformMatrix4fv(transformLoc, false, transform.elements);

  // draw axes
  gl.drawArrays(gl.LINES, 0, 2);

  // unbind shader and "disable" the attribute indices
  // (not really necessary when there is only one shader)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  gl.disableVertexAttribArray(positionIndex);
  gl.disableVertexAttribArray(colorIndex);
  gl.useProgram(null);
}

// entry point when page is loaded
function main() {

  // basically this function does setup that "should" only have to be done once,
  // while draw() does things that have to be repeated each time the canvas is
  // redrawn

  // retrieve <canvas> element
  var canvas = document.getElementById('theCanvas');

  // key handlers
  window.onkeypress = handleKeyPress;

  // get the rendering context for WebGL, using the utility from the teal book
  gl = getWebGLContext(canvas, false);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // load and compile the shader pair, using utility from the teal book
  var vshaderSource = document.getElementById('vertexShader').textContent;
  var fshaderSource = document.getElementById('fragmentShader').textContent;
  if (!initShaders(gl, vshaderSource, fshaderSource)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // retain a handle to the shader program, then unbind it
  // (This looks odd, but the way initShaders works is that it "binds" the shader and
  // stores the handle in an extra property of the gl object.  That's ok, but will really
  // mess things up when we have more than one shader pair.)
  shader = gl.program;
  gl.useProgram(null);

  // create model data
  var cube = makeCube();

  // buffer for vertex positions for triangles
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

  // buffer for vertex colors
  vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cube.colors, gl.STATIC_DRAW);


  // axes
  axisBuffer = gl.createBuffer();
  if (!axisBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);

  // buffer for axis colors
  axisColorBuffer = gl.createBuffer();
  if (!axisColorBuffer) {
	  console.log('Failed to create the buffer object');
	  return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, axisColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axisColors, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

	rBuffer = gl.createBuffer();
	if (!rBuffer){
		console.log("failed to create r buffer");
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, rBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, rVertices, gl.STATIC_DRAW);

	rColorBuffer = gl.createBuffer();
	if (!rColorBuffer){
		console.log("failed to create r color buffer");
		return;
	}
	gl.bindBuffer(gl.ARRAY_BUFFER, rColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, rColors, gl.STATIC_DRAW);

  // specify a fill color for clearing the framebuffer
  gl.clearColor(0.9, 0.9, 0.9, 1.0);

  gl.enable(gl.DEPTH_TEST);

  // define an animation loop
  var animate = function() {
	draw();

	// increase the rotation by 1 degree, depending on the axis chosen
	if (!paused)
	{

  		// multiply on *left* by a new one-degree rotation about the chosen axis
		  // this always rotates about one of the world coordinate axes
	  // switch(axis)
	  // {
		// case 'x':
		// 	model = new Matrix4().setRotate(1, 1, 0, 0).multiply(model);
		// 	axis = 'x';
		// 	break;
		// case 'y':
		// 	axis = 'y';
		// 	model = new Matrix4().setRotate(1, 0, 1, 0).multiply(model);
		// 	break;
		// case 'z':
		// 	axis = 'z';
		// 	model = new Matrix4().setRotate(1, 0, 0, 1).multiply(model);
		// 	break;
		// default:
		// }

   //model.rotate(1, 0, 1, 0);
	 model.rotate(1, axis[0], axis[1], axis[2]);

    // another way to get the same effect as above: multiply on left by
		// a new one-degree rotation about TRANSFORMED axis
//    var v;
//    switch(axis)
//    {
// 		case 'x':
//		  v = new Vector3([1, 0, 0]);
//      axis = 'x';
//      break;
//    case 'y':
//      axis = 'y';
//      v = new Vector3([0, 1, 0]);
//      break;
//    case 'z':
//      v = new Vector3([0, 0, 1]);
//
//      axis = 'z';
//      break;
//    default:
//		}
//    var newAxis = model.multiplyVector3(v);
//    var e = newAxis.elements;
//    model = new Matrix4().setRotate(1, e[0], e[1], e[2]).multiply(model);

	}

	// request that the browser calls animate() again "as soon as it can"
    requestAnimationFrame(animate, canvas);
  };

  // start drawing!
  animate();


}
