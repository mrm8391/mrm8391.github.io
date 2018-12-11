/*
Update physics and objects in simulation.
*/

var Update = {

	updatePhysics(){

		
		for(let s of planeSprings){
			let p1 = s.p1,
				p2 = s.p2;

			s.updateValues();

			if(!s.rip || !CONF.tearable){

				// Get spring force depending on spring displacement
				let springForce = CONF.springConstant * (s.length - s.restingLength);

				let springForceVec = s.unitVec.clone().multiplyScalar(springForce);

				// Dampen vectors, based on each point's velocity. 
				let p1dampen = p1.velocity.clone().multiplyScalar(CONF.dampConstant),
					p2dampen = p2.velocity.clone().multiplyScalar(CONF.dampConstant);

				// Set damping to zero if disabled
				if(!CONF.dampingOn){
					p1dampen.set(0,0,0);
					p2dampen.set(0,0,0);
				}

				// Dampen force in each direction, then apply
				let p1force = springForceVec.clone().sub(p1dampen),
					p2force = springForceVec.clone().negate().sub(p2dampen);

				p1.applyForce(p1force);
				p2.applyForce(p2force);
			}
			else if(((s.ripped) || (s.rip && !CONF.tornFacesVisible))){
				for (let i = 0; i < s.faceInds.length; i++){
					Update.toggleFaceVisibility(s.faceInds[i], false);
				}
			}// else do nothingif(!s.ripped)
			
		}

		
		for(let p of planeParticles){
			p.updatePosition(CONF.timeStep);
			
		}

		planeGeometry.verticesNeedUpdate = true;
	},

	updateObject(){

		//Shift object down, if stopping point not reached.
		if(objectBottom.constant > CONF.objectStopPoint){
			let moveVector = new THREE.Vector3(0,0,(-1)*CONF.objectDescendRate);
			objectGeometry.translate(moveVector.x,moveVector.y,moveVector.z);
			objectBoundingBox.translate(moveVector);
			objectBottom.translate(moveVector);
		}

		//Handle particles colliding with object. With simplified cube object,
		//we know there is a collision if cube bottom is below position 0
		//on z-axis.
		if(objectBottom.constant <= 0){
			for(let p of possibleCollisions){

				//If object collides with point, lock its z coordinate to the object's bottom.
				//This allows points to "slide" along bottom of cube, but prevents clipping with cube.
				//Ignore points that are pinned by other means.
				let min = objectBoundingBox.min;
				let max = objectBoundingBox.max;
				if(objectBoundingBox.containsPoint(p.position) && !p.pinned){
					p.position.z = objectBottom.constant -.1;
					p.zLock();
				}else if(p.checkNeighborsZLocked() && !p.pinned){
					p.position.z = objectBottom.constant -.1;
					p.softZLock();
					p.zUnlock();
				}
				else{
					p.zUnlock();
					p.softZUnlock();
				}
				
			}
		}

		//If object not colliding with plane at all, unpin all points
		else{
			for(let p of possibleCollisions){
				p.zUnlock();
				p.softZUnlock();
			}
		}
	},

	toggleFaceVisibility(faceIndex, visible){
		let face = planeGeometry.faces[faceIndex];

		//Change index of active material. Materials set in Main.initGeometry
		if(!visible)
			face.materialIndex = 1;
		else if(visible && !CONF.showWireframe)
			face.materialIndex = 0;
		else if(visible && CONF.showWireframe)
			face.materialIndex = 2;
		else
			throw "Unknown state in toggleFaceVisibility";

		planeGeometry.groupsNeedUpdate = true;
	},

	toggleWireframe(wireframeOn){

		for(let face of planeGeometry.faces){
			// Skip if face is invisible
			if(face.materialIndex === 1)
				continue;

			if(wireframeOn)
				face.materialIndex = 2;
			else
				face.materialIndex = 0;
		}

		planeGeometry.groupsNeedUpdate = true;
	},

	toggleObjectVisibility(visible){
		//Index of material in mesh to switch to. Materials set in Main.initCubeObject
		let newMaterialIndex = 0;

		//If switching to invisible, switch to transparent material
		if(!visible)
			newMaterialIndex = 1;

		for(let face of objectGeometry.faces){
			face.materialIndex = newMaterialIndex;
		}

		objectGeometry.groupsNeedUpdate = true;
	},

	setCamera(cameraPosObject){
		camera.up = cameraPosObject.up.clone();
		camera.position.x = cameraPosObject.position.x;
		camera.position.y = cameraPosObject.position.y;
		camera.position.z = cameraPosObject.position.z;
	},

	toggleCamera(){
		if(cameraBottom){
			Update.setCamera(sideCameraView);
		}else{
			Update.setCamera(bottomCameraView);
		}

		cameraBottom = !cameraBottom;
	}



}




