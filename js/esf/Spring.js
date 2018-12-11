/*
Simulates spring interaction for an edge between two vertices.

Logic manipulating spring objects is contained in Update.js.
*/

class Spring{

	// Static ID variable after class declaration

	static get springLength(){return 20;}

	// l = spring resting length. If zero, resting length computed from
	// point positions
	constructor(p1, p2, l = 0){
		this.p1 = p1;
		this.p2 = p2;
		
		this.rip = false;
		this.ripped = false;
		this.faceInds = [];
	    
	    this.length = 0;
	    this.restingLength = l;
	    if(l==0)
	    	this.restingLength = p1.position.distanceTo(p2.position);
	    this.pointVec = new THREE.Vector3();
	    this.unitVec = new THREE.Vector3();

	    this.id = Spring.nextId;
		Spring.nextId++;
	}

	updateValues(){
		this.length = this.p1.position.distanceTo(this.p2.position);
	    this.pointVec = this.p2.position.clone().sub(this.p1.position);
		this.unitVec = this.pointVec.clone().divideScalar(this.length);
		
		let boundFrom0 = CONF.cubeWidth/2 + .5/CONF.objectDescendRate;

		if(!(this.p1.position.x >= -boundFrom0 &&
			this.p1.position.x <= boundFrom0 &&
			this.p1.position.y >= -boundFrom0 &&
			this.p1.position.y <= boundFrom0) 
			
			&&
			this.restingLength > 0){
			
			
			
			// If the spring reaches its absolute tearing point, the face will tear
			// aka become hidden
			if(Math.abs(this.length - this.restingLength) > this.restingLength * CONF.maxStretchFactor / CONF.planeWidth + CONF.maxStretchFactor/5){
				this.ripped = true;
			}

			// If spring reaches max stable distance from equilibrium,
			// then as the spring keeps stretching, it will not be able to return to equilibrium
			// aka the spring is disabled from affecting its particles' velocities/force
			// but the incident faces 
			else if(Math.abs(this.length - this.restingLength) > this.restingLength * CONF.maxStretchFactor / CONF.planeWidth){
			//this.restingLength * CONF.maxStretchFactor * CONF.planeLevels){
			this.rip = true;
			}
		}
	}

	addFace(faceInd){
		if(this.faceInds.length < 2){
			this.faceInds.push(faceInd);
		}
	}
}

Spring.nextId = 0;