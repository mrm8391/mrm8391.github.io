
/*
A whole component dedicated to figuring out how spring-cube edge
collisions should work.

Code functional for an isolated spring going around an edge of cube, but
it gets complicated with multiple springs. It gets even more complicated
when accounting for springs across the corner of the cube (three plane intersection)
because then the "face" for the springs needs to slide across the corner of the cube.

Likely going to scrap this due to time constraints.
*/
var Corner = {

	/*
	Given a segment clipping through a cube, fix the clipping and determine
	how the segment should cross the corner.

	@param p1 First endpoint of clipping segment
	@param p2 Second endpoint of clipping segment
	@param plane1 First plane of cube that segment intersects
	@param plane2 Second plane of cube that segment intersects
	*/
	projectAroundCorner(){
	//projectAroundCorner(p1, p2, firstPlane, secondPlane){
		let firstPlane = new THREE.Plane(new THREE.Vector3(0,-1,0), (-1/2)*CONF.cubeWidth), 
		secondPlane = new THREE.Plane(new THREE.Vector3(0,0,-1), (-1/2)*CONF.cubeWidth);

		let p1 = new THREE.Vector3(-1,-6,-4);
		let p2 = new THREE.Vector3(1,-6,-4);
		let p3 = new THREE.Vector3(0, -2, -6);

		let p1corner = Corner.cubeCornerPoint(p1,p3, firstPlane, secondPlane);
		let p2corner = Corner.cubeCornerPoint(p2,p3, firstPlane, secondPlane);

		let p1target = Corner.projectThroughCorner(p1,p3,p1corner);
		let p2target = Corner.projectThroughCorner(p2,p3,p2corner);

		let finalTarget = math.intersect(
			[p1.x,p1.y,p1.z],[p1target.x,p1target.y,p1target.z],
			[p2.x,p2.y,p2.z],[p2target.x,p2target.y,p2target.z]
		);

		console.log("ayy lmao put a breakpoint on me");
	},

	/*
	Given a segment clipping the cube, and the spot where it crosses the corner,
	project the segment through the tip of the corner and resolve the clipping.

	@param p1 First endpoint of clipping segment
	@param p2 Second endpoint of clipping segment
	@param cornerCollision Where the segment should come in contact with the corner

	@return Target location where the segment should end
	*/
	projectThroughCorner(p1, p2, cornerCollision){

		let distanceToCorner = p1.distanceTo(cornerCollision);
		let fullMagnitude = p1.distanceTo(p2);

		let remainingMagnitude = fullMagnitude - distanceToCorner;
		let extendVector = new THREE.Vector3();
		extendVector.subVectors(cornerCollision, p1).normalize();
		extendVector.multiplyScalar(remainingMagnitude);

		let targetPoint = new THREE.Vector3();
		targetPoint.addVectors(cornerCollision, extendVector);

		return targetPoint;
	},

	/*
	Given a segment that passes through a cube, determine where it should
	intersect with the corner of the cube.

	@param p1 First endpoint of clipping segment
	@param p2 Second endpoint of clipping segment
	@param plane1 First plane of cube that segment intersects
	@param plane2 Second plane of cube that segment intersects

	@return Vertex of collision point
	*/
	cubeCornerPoint(p1, p2, firstPlane, secondPlane){
		
		let startPoint, direction;
		[startPoint, direction] = Corner.intersectPlanes(firstPlane, secondPlane);

		//Set start point to beginning of cube edge
		if(startPoint.x === 0)
			startPoint.x = ((-1)*direction.x) * (CONF.cubeWidth / 2);
		else if(startPoint.y === 0)
			startPoint.y = ((-1)*direction.y) * (CONF.cubeWidth / 2);
		else if(startPoint.z === 0)
			startPoint.z = ((-1)*direction.z) * (CONF.cubeWidth / 2);
		else throw "invalid state for cube corner intersection";

		//Add direction (unit vec) times cube width to find endpoint
		let endPoint = startPoint.clone();
		endPoint.addScaledVector(direction, CONF.cubeWidth);

		let c1 = startPoint, c2 = endPoint;

		let cornerSpot;
		if(firstPlane.normal.x != 0){
			// First face on x plane, so do a y-z intersection
			// to plane edge
			let flatIntersect = 
				math.intersect([p1.y,p1.z],[p2.y,p2.z],[c1.y,c1.z],[c2.y,c2.z]);

			cornerSpot = new THREE.Vector3(firstPlane.constant, flatIntersect[0], flatIntersect[1]);
		}else if(firstPlane.normal.y != 0){
			// First face on y plane, so do x-z 2d intersection
			let flatIntersect = 
				math.intersect([p1.x,p1.z],[p2.x,p2.z],[c1.x,c1.z],[c2.x,c2.z]);

			cornerSpot = new THREE.Vector3(flatIntersect[0], firstPlane.constant, flatIntersect[1]);
		}else if(firstPlane.normal.z != 0){
			// First face on z plane, so do x-y 2d intersection
			let flatIntersect = 
				math.intersect([p1.x,p1.y],[p2.x,p2.y],[c1.x,c1.y],[c2.x,c2.y]);

			cornerSpot = new THREE.Vector3(flatIntersect[0], flatIntersect[1], firstPlane.constant);
		}

		return cornerSpot;
	},

	/*
	Code taken from an anonymous user on stackoverflow. It had to be modified
	slightly to work with negative numbers. https://stackoverflow.com/a/38437831
	(Comments below this written by original author).

	Algorithm taken from http://geomalgorithms.com/a05-_intersect-1.html. See the
	section 'Intersection of 2 Planes' and specifically the subsection
	(A) Direct Linear Equation

	*/
	intersectPlanes(p1, p2) {

		// the cross product gives us the direction of the line at the intersection
		// of the two planes, and gives us an easy way to check if the two planes
		// are parallel - the cross product will have zero magnitude
		var direction = new THREE.Vector3().crossVectors(p1.normal, p2.normal)
		var magnitude = direction.distanceTo(new THREE.Vector3(0, 0, 0))
		if (magnitude === 0) {
			return null
		}

		// now find a point on the intersection. We use the 'Direct Linear Equation'
		// method described in the linked page, and we choose which coordinate
		// to set as zero by seeing which has the largest absolute value in the
		// directional vector

		var X = Math.abs(direction.x)
		var Y = Math.abs(direction.y)
		var Z = Math.abs(direction.z)

		var point

		if (Z >= X && Z >= Y) {
			point = Corner.solveIntersectingPoint('z', 'x', 'y', p1, p2)
		} else if (Y >= Z && Y >= X) {
			point = Corner.solveIntersectingPoint('y', 'z', 'x', p1, p2)
		} else {
			point = Corner.solveIntersectingPoint('x', 'y', 'z', p1, p2)
		}

		return [point, direction]
	},


	/*
	Code taken from an anonymous user on stackoverflow. It had to be modified
	slightly to work with negative numbers. https://stackoverflow.com/a/38437831
	(Comments below this written by original author).

	This method helps finding a point on the intersection between two planes.
	Depending on the orientation of the planes, the problem could solve for the
	zero point on either the x, y or z axis

	*/
	solveIntersectingPoint(zeroCoord, A, B, p1, p2) {
		let OFFSET = 1000;

		var a1 = p1.normal[A];
		var b1 = p1.normal[B];
		var d1 = p1.constant + OFFSET;

		var a2 = p2.normal[A];
		var b2 = p2.normal[B];
		var d2 = p2.constant + OFFSET;

		var A0 = ((b2 * d1) - (b1 * d2)) / ((a1 * b2 - a2 * b1))
		var B0 = ((a1 * d2) - (a2 * d1)) / ((a1 * b2 - a2 * b1))

		// var A0 = ((b1 * d2) - (b2 * d1)) / ((a1 * b2 - a2 * b1))
		// var B0 = ((a2 * d1) - (a1 * d2)) / ((a1 * b2 - a2 * b1))

		var point = new THREE.Vector3()
		point[zeroCoord] = 0
		point[A] = Math.abs(A0) - OFFSET;
		point[B] = Math.abs(B0) - OFFSET;

		return point
	},

}