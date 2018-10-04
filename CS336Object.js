/**
 * Encapsulation of scale, rotation, and position of a 3D object.
 * The object's transformation matrix is defined as the product of
 * three transformations based on position * rotation * scale.
 */
var CS336Object = function()
{

  // position of this object
  this.position = new Vector3();

  // current rotation matrix
  this.rotation = new Matrix4();

  // scale for this object
  this.scale = new Vector3([ 1, 1, 1 ]);

  // the object's current transformation, to be calculated
  // as translate * rotate * scale
  // matrix is cached on call to getMatrix, to avoid recalculation
  // at every frame unless needed
  this.matrix = null;
  this.matrixNeedsUpdate = true;
};

/**
 * Sets the position.
 * @param x
 * @param y
 * @param z
 */
CS336Object.prototype.setPosition = function(x, y, z)
{
  this.position = new Vector3([ x, y, z ]);
  this.matrixNeedsUpdate = true;
};

/**
 * Sets the scale.
 * @param x
 * @param y
 * @param z
 */
CS336Object.prototype.setScale = function(x, y, z)
{
  this.scale = new Vector3([ x, y, z ]);
  this.matrixNeedsUpdate = true;
};

/**
 * Sets the current rotation matrix to the given one.
 */
CS336Object.prototype.setRotation = function(rotationMatrix)
{
  this.rotation = new Matrix4(rotationMatrix);
  this.matrixNeedsUpdate = true;
};

/**
 * Returns the current transformation matrix, defined as
 * translate * rotate * scale.
 * @returns
 */
CS336Object.prototype.getMatrix = function()
{
  if (this.matrixNeedsUpdate)
  {
    // compose the scale, rotation, and translation components
    // and cache the resulting matrix
    var px, py, pz, sx, sy, sz;
    px = this.position.elements[0];
    py = this.position.elements[1];
    pz = this.position.elements[2];
    sx = this.scale.elements[0];
    sy = this.scale.elements[1];
    sz = this.scale.elements[2];

    this.matrixNeedsUpdate = false;
    this.matrix = new Matrix4().setTranslate(px, py, pz)
        .multiply(this.rotation).scale(sx, sy, sz);
  }
  return this.matrix;
};

/**
 * Moves the CS336Object along its negative z-axis by the given amount.
 */
CS336Object.prototype.moveForward = function(distance)
{
  // TODO
};

/**
 * Moves the CS336Object along its positive z-axis by the given amount.
 */
CS336Object.prototype.moveBack = function(distance)
{
  this.moveForward(-distance);
};

/**
 * Moves the CS336Object along its positive x-axis by the given amount.
 */
CS336Object.prototype.moveRight = function(distance)
{
  // TODO
};

/**
 * Moves the CS336Object along its negative x-axis by the given amount.
 */
CS336Object.prototype.moveLeft = function(distance)
{
  this.moveRight(-distance);
};

/**
 * Moves the CS336Object along its own y-axis by the given amount.
 */
CS336Object.prototype.moveUp = function(distance)
{
  // TODO
};

/**
 * Moves the CS336Object along its own negative y-axis by the given amount.
 */
CS336Object.prototype.moveDown = function(distance)
{
  this.moveUp(-distance);
};

/**
 * Rotates the CS336Object ccw about its x-axis.
 */
CS336Object.prototype.rotateX = function(degrees)
{
  // TODO
};

/**
 * Rotates the CS336Object ccw about its y-axis.
 */
CS336Object.prototype.rotateY = function(degrees)
{
  // TODO
};

/**
 * Rotates the CS336Object ccw about its z-axis.
 */
CS336Object.prototype.rotateZ = function(degrees)
{
  // TODO
};

/**
 * Rotates the CS336Object ccw about the given axis, specified as a vector.
 */
CS336Object.prototype.rotateOnAxis = function(degrees, x, y, z)
{
  // TODO
};

/**
 * Rotates the CS336Object ccw about the given axis, specified in terms of
 * pitch and head angles (as in spherical coordinates).
 */
CS336Object.prototype.rotateOnAxisEuler = function(degrees, pitch, head)
{
  // TODO
};

/**
 * Rotates the CS336Object counterclockwise about an axis through its center that is
 * parallel to the vector (0, 1, 0).
 */
CS336Object.prototype.turnLeft = function(degrees)
{
  // TODO
};

/**
 * Rotates the CS336Object clockwise about an axis through its center that is
 * parallel to the vector (0, 1, 0).
 */
CS336Object.prototype.turnRight = function(degrees)
{
  this.turnLeft(-degrees);
};

/**
 * Performs a counterclockwise rotation about this object's
 * x-axis.
 */
CS336Object.prototype.lookUp = function(degrees)
{
   this.rotateX(degrees);
};

/**
 * Performs a clockwise rotation about this object's
 * x-axis.
 */
CS336Object.prototype.lookDown = function(degrees)
{
  this.lookUp(-degrees);
};


/**
 * Moves the CS336Object the given number of degrees along a great circle. The axis
 * of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
 * positive z-axis the given distance in front of the CS336Object. (This operation is
 * equivalent to a moveForward, lookDown and then moveBack.
 */
CS336Object.prototype.orbitUp = function(degrees, distance)
{
  // TODO
};

/**
 * Moves the CS336Object the given number of degrees along a great circle. The axis
 * of rotation is parallel to the CS336Object's x-axis and intersects the CS336Object's
 * positive z-axis the given distance in front of the CS336Object. (This operation is
 * equivalent to a moveForward, lookUp and then moveBack.
 */
CS336Object.prototype.orbitDown = function(degrees, distance)
{
  this.orbitUp(-degrees, distance);
};

/**
 * Moves the CS336Object the given number of degrees around a circle of latitude. The
 * axis of rotation is parallel to the world up vector and intersects the
 * CS336Object's positive z-axis the given distance in front of the CS336Object. (This
 * operation is equivalent to a moveForward, turnLeft, and moveBack.)
 */
CS336Object.prototype.orbitRight = function(degrees, distance)
{
  // TODO
};

/**
 * Moves the CS336Object the given number of degrees around a circle of latitude. The
 * axis of rotation is parallel to the world up vector and intersects the
 * CS336Object's positive z-axis the given distance in front of the CS336Object. (This
 * operation is equivalent to a moveForward, turnRight, and moveBack.)
 */
CS336Object.prototype.orbitLeft = function(degrees, distance)
{
  this.orbitRight(-degrees, distance);
};

/**
 * Orients the CS336Object at its current location to face the given position
 * using (0, 1, 0) as the up-vector.  That is, the given position will lie along
 * the object's negative z-axis, and this object's x-axis will be
 * parallel to the world x-z plane
 */
CS336Object.prototype.lookAt = function(x, y, z)
{
	//
	// this is essentially the same as the lookAt function in matrix4, but
	// a) we don't invert it
	// b) there is no translation to worry about
	//
	// The given x, y, z are the coordinates of the look-at point
	// We use the world up vector (0, 1, 0) for up
	//
	var fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

	fx =  x - this.position.elements[0];
	fy =  y - this.position.elements[1];
	fz =  z - this.position.elements[2] ;

	// Normalize f.
	rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
	fx *= rlf;
	fy *= rlf;
	fz *= rlf;

	//Define up
	upX = 0;
	upY = 1;
	upZ = 0;

	// Calculate cross product of f and up.
	sx = fy * upZ - fz * upY;
	sy = fz * upX - fx * upZ;
	sz = fx * upY - fy * upX;

	// Normalize s.
	rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
	sx *= rls;
	sy *= rls;
	sz *= rls;

	// Calculate cross product of s and f.
	ux = sy * fz - sz * fy;
	uy = sz * fx - sx * fz;
	uz = sx * fy - sy * fx;

	// Set the three columns of the rotation matrix
	this.rotation.elements[0] = sx;
	this.rotation.elements[1] = sy;
	this.rotation.elements[2] = sz;

	this.rotation.elements[4] = ux;
	this.rotation.elements[5] = uy;
	this.rotation.elements[6] = uz;

	this.rotation.elements[8] = -fx;
	this.rotation.elements[9] = -fy;
	this.rotation.elements[10] = -fz;

	this.matrixNeedsUpdate = true;
};
