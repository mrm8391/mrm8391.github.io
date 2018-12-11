/*
Definition of constants that alter simulation.
*/

var CONF = {

	//
	//Physics
	//
	timeStep: 0.01, //time that passes each frame of animation. Used to update particle positions
	dampingOn: true, //false to disable damping of spring energy
	dampConstant: .75, //how heavily to damp spring energy
	springConstant: 1.25,
	pixelsPerMeter: 50,

	//
	//Plane and object properties
	//
	planeLevels: 25, //How many levels the plane is tesselated to
	planeWidth: 50, //width of the plane in pixels
	objectDescendRate: .125, //speed, in pixels, that the object descends
	objectStopPoint: -50, //Where to stop object movement. null indicates no stop
	maxStretchFactor: 50,
	cubeWidth: 10,
	cubeStartHeight: 20,
	showWireframe: false,
	cubeVisible: true,
	delaunayTriangulation: true,
	tornFacesVisible: false,
	tearable: true,
	
	//
	//Misc
	//
	startPaused: false,
	cameraBottomView: false //set camera view to be below the plane
}