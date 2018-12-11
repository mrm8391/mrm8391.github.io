/*
Wrapper around a ThreeJS vertex for the Mass-Spring model.

Contains information needed to move the vertex in response to
spring energy.
*/

class Particle{

	// Static ID variable after class declaration

	constructor(verticy){
		this.position = verticy;
		this.velocity = new THREE.Vector3();
		this.mass = 1.0;
		this.force = new THREE.Vector3(0,0,0);
		this.pinned = false;
		this.zLocked = false;
		this.softZLocked = false;
		this.springs = new Set();
		this.faces = new Set();

		this.id = Particle.nextId;
		Particle.nextId++;
	}

	addSpring(s){
		this.springs.add(s);
	}

	addFace(f){
		this.faces.add(f);
	}

	checkNeighborsZLocked(){
		for(let s of this.springs){
			if(s.p1.zLocked || s.p2.zLocked)
				return true;1
		}

		return false;
	}

	/*
	Pin this particle, preventing it from moving due to force/velocity.

	@param at Optional parameter to pin the particle at a specific location.
	          Particle remains at its current spot if not specified.
	*/
	pin(at = null){
		this.pinned = true;

		if(at != null){
			this.position.set(at.x,at.y,at.z);
		}
	}

	/*
	Allow this particle to move again.
	*/
	unpin(){
		this.pinned = false;
	}

	/*
	Prevent particle from moving along Z-axis.

	Intended for use for particles colliding with bottom of an object, to
	prevent particle from moving vertically.
	*/
	zLock(){
		this.zLocked = true;
	}

	zUnlock(){
		this.zLocked = false;
	}

	softZLock(){
		this.softZLocked = true;
	}

	softZUnlock(){
		this.softZLocked = false;
	}

	applyForce(f){
		this.force.add(f);
	}

	updatePosition(dt){
		if(this.pinned) return;

		// Change in velocity
		let dv = this.force.clone();
		dv.multiplyScalar(dt);
		dv.divideScalar(this.mass);


		this.velocity.add(dv);

		// Change in position
		let dX = this.velocity.clone();
		dX.multiplyScalar(CONF.pixelsPerMeter);
		dX.multiplyScalar(dt);

		//Disable z movement if particle colliding with object.
		//In addition, if a neighbor is zlocked, cancel z movement
		//to prevent clipping with the cube.
		if(this.zLocked || this.softZLocked){
			let dxLength = dX.length();
			dX.normalize();
			dX.set(dX.x,dX.y,0);
			dX.multiplyScalar(dxLength);
		}

		// Test for and handle collision with object.
		let newPos = new THREE.Vector3();
		newPos.addVectors(this.position, dX);

		if(objectBoundingBox.containsPoint(newPos)){
			//Collision detected. This implies that the point is moving
			//from a non-colliding position to a colliding one.
			//To handle this, cancel out movement in the axis that
			//is pushing the point into the cube.
			let transLine = new THREE.Line3(this.position, newPos);

			for(let face of objectSideFaces){
				//Bingo, found the intersected side
				if(face.intersectsLine(transLine)){
					//Now, negate movement into this axis by rotating
					//movement vector alongside axis of face.
					let dxLength = dX.length();
					
					//Convert to unit vector
					dX.normalize();

					if(face.normal.x != 0)
						dX.set(0,dX.y,dX.z);
					else if(face.normal.y != 0)
						dX.set(dX.x,0,dX.z);
					else
						dX.set(dX.x,dX.y,0);

					//now, expand vector along axes of face
					dX.multiplyScalar(dxLength);

					//No need to check other faces.
					break;
				}
			}
		}

		this.position.add(dX);

		this.force = new THREE.Vector3(0,0,0);
	}
}

Particle.nextId = 0;