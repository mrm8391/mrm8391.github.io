var Buttons = {

	initializeButton: document.getElementById('initializeId'),
	pauseInput: document.getElementById('pauseId'),
	dampInput: document.getElementById('dampId'),
	tearInput: document.getElementById('tearId'),
	tearVisibleInput: document.getElementById('tearVisibleId'),
	cubeVisibleInput: document.getElementById('cubeVisibleId'),
	cameraButton: document.getElementById('cameraId'),
	wireframeInput: document.getElementById('wireframeId'),
	ourDTInput: document.getElementById('ourDTId'),

	planeLevelBox: document.getElementById('planeLevelId'),
	objectDescendBox: document.getElementById('objectDescendId'),
	cubeWidthBox: document.getElementById('cubeWidthId'),
	stopPointBox: document.getElementById('stopPointId'),
	maxStretchBox: document.getElementById('maxStretchId'),

	allElements: null,

	registerPageInputs(){
		Buttons.initializeButton.onclick = function() {
			if(!simulationRunning){
				initAndStart();
			}else{
				resetSimulation();
			}
		};

		Buttons.pauseInput.onclick = function() {physicsPause = this.checked;};
		Buttons.dampInput.onclick = function() {CONF.dampingOn = this.checked;};
		Buttons.tearInput.onclick = function() {CONF.tearable = this.checked;};
		Buttons.tearVisibleInput.onclick = function() {CONF.tornFacesVisible = this.checked;};
		Buttons.cubeVisibleInput.onclick = function() {CONF.cubeVisible = this.checked; Update.toggleObjectVisibility(this.checked);};
		Buttons.cameraButton.onclick = function() {Update.toggleCamera();};
		Buttons.wireframeInput.onclick = function() {CONF.showWireframe = this.checked; Update.toggleWireframe(this.checked);};
		Buttons.ourDTInput.onclick = function() {CONF.ourDT = this.checked;};

		Buttons.initialize();

		Buttons.allElements = [Buttons.startButton, Buttons.dampButton];
	},

	/*
	Initialize checkboxes and text fields to values
	from Config.js
	*/
	initialize(){
		Buttons.pauseInput.checked = CONF.startPaused;
		Buttons.dampInput.checked = CONF.dampingOn;
		Buttons.tearInput.checked = CONF.tearable;
		Buttons.tearVisibleInput.checked = CONF.tornFacesVisible;
		Buttons.cubeVisibleInput.checked = CONF.cubeVisible;

		Buttons.planeLevelBox.value = CONF.planeLevels;
		Buttons.objectDescendBox.value = CONF.objectDescendRate;
		Buttons.cubeWidthBox.value = CONF.cubeWidth;
		Buttons.stopPointBox.value = CONF.objectStopPoint;
		Buttons.maxStretchBox.value = CONF.maxStretchFactor;
	},

	/*
	Update Config.js based on values in text boxes.

	Does not validate!
	*/
	updateFromTextFields(){
		CONF.planeLevels = parseFloat(Buttons.planeLevelBox.value);
		CONF.objectDescendRate = parseFloat(Buttons.objectDescendBox.value);
		CONF.cubeWidth = parseFloat(Buttons.cubeWidthBox.value);
		CONF.objectStopPoint = parseFloat(Buttons.stopPointBox.value);
		CONF.maxStretchFactor = parseFloat(Buttons.maxStretchBox.value);
	},

	disable(element){
		element.disabled = true;
	},

	enable(element){
		element.disabled = false;
	},

	reset(){
		for(let element of allElements){
			Buttons.enable(element);
		}
	}
}