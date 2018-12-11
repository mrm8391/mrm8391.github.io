/*
Entry point of simulation.

Defines globals, initializes simulation, and starts render loop.
*/

if ( WEBGL.isWebGLAvailable() === false ) {
	document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

// threejs globals
var camera, controls, scene, renderer;

// the rubber plane, and its properties
var planeGeometry;
var planeParticles;
var planeSprings;

// the object pushing into the plane, and associated data
var objectGeometry;
var objectBoundingBox; //bounding box for testing collisions
var objectSideFaces; //planes for each side of cube (excluding top)
var objectBottom; //plane associated with bottom of cube object
var possibleCollisions; //points on the plane that can collide with object
var currentCollisions; //points on the plane that are currently colliding (NOT USED YET)

// Runtime constants
var cameraBottom = CONF.cameraBottomView;
var simulationRunning = false;
var physicsPause = CONF.startPaused;

var sideCameraView = {
	up: new THREE.Vector3(0,-10,100),
	position: new THREE.Vector3(0, -100, 10)
};

var bottomCameraView = {
	up: new THREE.Vector3(0,-1,0),
	position: new THREE.Vector3(0, 0.5, -75)
};

//
// Main; entry point of simulation
//

Buttons.registerPageInputs();

function initAndStart(){
	Buttons.updateFromTextFields();
	simulationRunning = true;

	initPlane();
	initScene();
	animate();
}

function resetSimulation(){
	simulationRunning = false;

	Utils.disposeHierarchy(scene, Utils.disposeNode);
	initAndStart();
}

function initPlane(){
	let plane = null;
	if(CONF.delaunayTriangulation){
		let start_time = new Date();
		plane = Plane.DelaunayTriangulatedPlane(CONF.planeWidth, CONF.planeLevels);
		let end_time = new Date();
		let total_time = end_time - start_time;
		console.log("Total seconds to generate this plane: " + total_time);
	}
	else{
		let start_time = new Date();
		plane = Plane.crossTessellatedPlane(CONF.planeWidth, CONF.planeLevels);
		let end_time = new Date();
		let total_time = end_time - start_time;
		console.log("Total seconds to generate this plane: " + total_time);
	}
	let particles = [];
	let springs = [];

	// Current design involves a primitive cube as the object.
	// Create bounding box to determine particles that
	// can collide with the cube.
	let collisions = [];
	let bound = CONF.cubeWidth/2;
	let boundingBox = new THREE.Box3(
		new THREE.Vector3((-1)*bound,(-1)*bound,-1),
		new THREE.Vector3(bound,bound,1)
	);

	// Register each verticy as a particle.
	for(let i = 0; i < plane.vertices.length; i++){
		let p = new Particle(plane.vertices[i]);

		//Pin verticy if it is on the edge of the plane, to
		//prevent plane from moving. Disabled for alternative
		//triangulation due to bugs right now
		if(!CONF.delaunayTriangulation){
			if(Plane.isPointOnEdgeOfPlane(i,CONF.planeLevels)){
				p.pin();
			}
		}
		else {
			if(EdgeVerts.hasVert(i)){
				p.pin();
			}
		}
		
		
		//Check if particle will collide with cube
		if(boundingBox.containsPoint(p.position))
			collisions.push(p);

		particles.push(p);
	}

	// Create a spring for every edge.
	// Hash each pair to ensure no duplicates are added.
	let addedPairs = new Set();
	let addedSprings = new Map();

	for(let i = 0; i < plane.faces.length; i++){
		let v1 = plane.faces[i].a,
			v2 = plane.faces[i].b,
			v3 = plane.faces[i].c;

		let p1 = particles[v1],
			p2 = particles[v2],
			p3 = particles[v3];

		let hash12 = Utils.cantorHash(v1,v2),
			hash23 = Utils.cantorHash(v2,v3),
			hash31 = Utils.cantorHash(v3,v1);

		if(!addedPairs.has(hash12)){
			let s = new Spring(p1,p2);
			s.addFace(i);
			addedSprings.set(hash12, s);
			
			springs.push(s);
			p1.addSpring(s);
			p2.addSpring(s);
			addedPairs.add(hash12);
		}
		else{
			//Add face to existing spring
			addedSprings.get(hash12).addFace(i);
		}

		if(!addedPairs.has(hash23)){
			let s = new Spring(p2,p3);
			s.addFace(i);
			addedSprings.set(hash23, s);
			
			springs.push(s);
			p2.addSpring(s);
			p3.addSpring(s);
			addedPairs.add(hash23);
		}
		else{
			//Add face to existing spring
			addedSprings.get(hash23).addFace(i);
		}

		
		if(!addedPairs.has(hash31)){
			let s = new Spring(p3,p1);
			s.addFace(i);
			addedSprings.set(hash31, s);
			
			springs.push(s);
			p3.addSpring(s);
			p1.addSpring(s);
			addedPairs.add(hash31);
		}
		else{
			//Add face to existing spring
			addedSprings.get(hash31).addFace(i);
		}
	}

	//set globals
	planeGeometry = plane;
	planeParticles = particles;
	planeSprings = springs;
	possibleCollisions = collisions;
	currentCollisions = [];

	//particles[0].position.x -=10;
	//particles[0].position.y -=5;
	//particles[0].position.x -=15;
}

function initScene() {

	// Camera and controls
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

	if(!CONF.cameraBottomView){
		Update.setCamera(sideCameraView);
	}else{
		Update.setCamera(bottomCameraView);
	}

	camera.lookAt(new THREE.Vector3(0,0,0));

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xcccccc );
	//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

	// lights
	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );
	var light = new THREE.DirectionalLight( 0x002288 );
	light.position.set( -1, -1, -1 );
	scene.add( light );
	var light = new THREE.AmbientLight( 0x222222 );
	scene.add( light );

	// renderer

	// placeholder for side by side view
	let threejsCanvas = document.getElementById('simulationCanvas');
	let canvasParent = document.getElementById('simulationParent');
	let w = window.getComputedStyle(canvasParent, null).width;
	let h = window.getComputedStyle(canvasParent, null).height;
	threejsCanvas.setAttribute('width', w);
	threejsCanvas.setAttribute('height', h);

	renderer = new THREE.WebGLRenderer( { antialias: true, canvas: threejsCanvas} );
	// renderer = new THREE.WebGLRenderer( { antialias: true} );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( parseInt(w,10), parseInt(h,10));
	// renderer.setSize( window.innerWidth, window.innerHeight);
	
	// document.body.appendChild( renderer.domElement );

	// Controls. Ensure event listeners are only registered for threejs canvas,
	// otherwise input fields won't work.
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [ 65, 83, 68 ];
	controls.addEventListener( 'change', render );
	
	window.addEventListener( 'resize', updateCanvasSize, false );

	initGeometry();
	initCubeObject(10, 20);


	render();
}

function initGeometry(){

	let planeMaterial = new THREE.MeshPhongMaterial( {
		color: 0xff80ff, flatShading: true
	} );

	let transparentMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
	
	let wireframeMaterial = new THREE.MeshPhongMaterial( {
		color: 0xff80ff, flatShading: true, wireframe: true
	} );
	
	let materials = [planeMaterial, transparentMaterial, wireframeMaterial];

	planeMaterial.side = THREE.DoubleSide;
	wireframeMaterial.side = THREE.DoubleSide;

	var planeMesh = new THREE.Mesh( planeGeometry, materials );
	planeMesh.position = new THREE.Vector3(0,0,0);
	planeMesh.updateMatrix();
	planeMesh.matrixAutoUpdate = false;
	scene.add( planeMesh );

	// Ensure all material indices are correct
	Update.toggleWireframe(CONF.showWireframe);
}

function initCubeObject(){

	//Create global bounding box that moves with cube, to
	//actively test for collisions.
	let bound = CONF.cubeWidth/2;
	let cubeTranslation = new THREE.Vector3(0,0,CONF.cubeStartHeight);
	let boundingBox = new THREE.Box3(
		new THREE.Vector3((-1)*bound,(-1)*bound,(-1)*bound - 1),
		new THREE.Vector3(bound,bound,bound)
	);
	boundingBox.translate(cubeTranslation);

	//Create planes for collision with sides of cube.
	let leftF = new THREE.Plane(new THREE.Vector3(-1,0,0), (-1)*bound);
	let rightF = new THREE.Plane(new THREE.Vector3(1,0,0), bound);
	let frontF = new THREE.Plane(new THREE.Vector3(0,-1,0), (-1)*bound);
	let backF = new THREE.Plane(new THREE.Vector3(0,1,0), bound);
	let bottomF = new THREE.Plane(new THREE.Vector3(0,0,-1), (-1)*bound);
	bottomF.translate(cubeTranslation);

	// Now, initialize cube object in scene
	var objectMaterial = new THREE.MeshPhongMaterial( {
		color: 0x000000, flatShading: true
	});
	let transparentMaterial = new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
	let materials = [objectMaterial, transparentMaterial];

	let geometry = new THREE.BoxGeometry(CONF.cubeWidth,CONF.cubeWidth,CONF.cubeWidth);
	geometry.translate(cubeTranslation.x,cubeTranslation.y,cubeTranslation.z);

	var objectMesh = new THREE.Mesh(geometry, materials);
	scene.add(objectMesh);

	// set globals
	objectGeometry = geometry;
	objectBoundingBox = boundingBox;
	objectSideFaces = [leftF,backF,rightF,frontF,bottomF];
	objectBottom = bottomF;

	// Lastly, set visibility now that global is set
	Update.toggleObjectVisibility(CONF.cubeVisible);
}

function updateCanvasSize() {
	let threejsCanvas = document.getElementById('simulationCanvas');
	let canvasParent = document.getElementById('simulationParent');
	let w = window.getComputedStyle(canvasParent, null).width;
	let h = window.getComputedStyle(canvasParent, null).height;
	threejsCanvas.setAttribute('width', w);
	threejsCanvas.setAttribute('height', h);
	
	camera.aspect = parseInt(w,10) / parseInt(h,10);
	camera.updateProjectionMatrix();
	renderer.setSize( parseInt(w,10), parseInt(h,10));
	controls.handleResize();
	//render();
}

function animate() {
	// If simulation no longer running (ie reset)
	// then cancel the animation loop
	if(!simulationRunning) return;

	requestAnimationFrame( animate );

	// Update camera position
	controls.update();

	// Update physics. Still renders if this is disabled, 
	// so camera can be moved
	if(!physicsPause){
		Update.updateObject();
		Update.updatePhysics();
	}

	renderer.render( scene, camera );
}

function render() {
	renderer.render( scene, camera );
}
