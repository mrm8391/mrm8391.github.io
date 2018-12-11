/*
Create and manipulate a custom tessellated plane object.
*/


var Plane = {
	
	/*
	Custom plane tessellation that creates boxes with an X pattern.
	The X within each box forms the triangles, causing all verticies
	to share an edge with each of its 8 nearest neighbors.

	A vertex that is on the X of each box is a "cross" vertex, and
	a vertex on the border of a box is a "box" vertex.

	@param width Length of one side of the plane
	@param levels Number of levels to tesselate. Creates one "box" per level.

	@return Threejs geometry object with tessellated faces of the plane
	*/
	crossTessellatedPlane(width, levels){

		// End result will look like a bunch of boxes with
		// X's through the middle.

		// This will be tessellated by iterating through all
		// the "box" points, connecting with the "cross" points
		// as the boxes are traversed.

		let plane = new THREE.Geometry();

		// Vertices are stored in a 1D array. Each "row" consists of box points
		// or cross points, with rows alternating. Box or cross points
		// can be found with the following indices:
		// box[row][col] = vertices[(row * (2n + 1)) + col]
		// cross[row][col] = vertices[((row+1)*(n+1)) + (row*n) + col]
		let vertices = plane.vertices;
		let faces = plane.faces;

		let boxStart = 0 - (width / 2),
			boxIncrement = (width / levels)
			crossStart = boxStart + (boxIncrement / 2);

		// Generate points
		for(let i = 0; i < levels + 1; i++){

			// Create row of box points
			for(let j = 0; j < levels + 1; j++){

				let boxPt = new THREE.Vector3(
					boxStart + (j*boxIncrement),
					boxStart + (i*boxIncrement),
					0
				);

				vertices.push(boxPt);

			}

			// Create row of cross points, if not at top level.
			if(i!=levels){
				for(let j = 0; j < levels; j++){

						let crossPt = new THREE.Vector3(
							crossStart + (j*boxIncrement),
							crossStart + (i*boxIncrement),
							0
						);

						vertices.push(crossPt);
				}
			}
		}

		// Helpers to get indices easily
		//let boxIndex = function(row, col){ return (row * (2*levels + 1)) + col; };
		//let crossIndex = function(row, col){ return ((row+1)*(levels+1)) + (row*levels) + col; };

		// Generate faces
		for(let i = 0; i < levels; i++){
			for(let j = 0; j < levels; j++){

				// Get all 5 points in current box
				let b1 = Plane.boxIndex(i,j,levels),
					b2 = Plane.boxIndex(i,j+1,levels),
					b3 = Plane.boxIndex(i+1,j,levels),
					b4 = Plane.boxIndex(i+1,j+1,levels),
					cross = Plane.crossIndex(i,j,levels);

				// Create all possible faces from these
				faces.push(new THREE.Face3(b1,b2,cross));
				faces.push(new THREE.Face3(b2,b4,cross));
				faces.push(new THREE.Face3(b4,b3,cross));
				faces.push(new THREE.Face3(b3,b1,cross));
			}
		}

		return plane;
	},

	/**
	Custom plane tessellation that creates boxes with an X pattern.
	The X within each box forms the triangles, causing all verticies
	to share an edge with each of its 8 nearest neighbors.

	A vertex that is on the X of each box is a "cross" vertex, and
	a vertex on the border of a box is a "box" vertex.

	@param width Length of one side of the plane
	@param levels Number of levels to tesselate. Creates one "box" per level.

	@return Threejs geometry object with tessellated faces of the plane
	*/
	DelaunayTriangulatedPlane(width, levels){
		let points = [];

		let boxStart = 0 - (width / 2),
			boxIncrement = (width / levels)
			crossStart = boxStart + (boxIncrement / 2);

		let numOfPoints = Math.pow(levels, 2) + Math.pow(levels - 1, 2);
		for(let i = 0; i < numOfPoints; i++){
			points.push(
				[(Math.random() * (-boxStart - boxStart) + boxStart),
				(Math.random() * (-boxStart - boxStart) + boxStart)
				]
			);
		}

		//Add points along the edges of the bounding square, to lock
		//in the edges
		points.push(
			[boxStart, boxStart],
			[-boxStart, boxStart],
			[-boxStart, -boxStart],
			[-boxStart, boxStart]);
			//[boxStart/2, boxStart],
			//[0, boxStart],
			//[-boxStart/2, boxStart]);*/
		/*
		// Generate points
		for(let i = 0; i < levels + 1; i++){

				let rowPt = new THREE.Vector3(
					boxStart + (i*boxIncrement),
					boxStart

				);

				points.push(rowPt);

				rowPt = new THREE.Vector3(
					boxStart + (i*boxIncrement),
					-boxStart
					
				);

				points.push(rowPt);
			
			if(i == 0 || i == levels){
			for(let j = 0; j < levels + 1; j++){
				let colPt = new THREE.Vector3(
					boxStart,
					boxStart + (j*boxIncrement)
					
				);

				points.push(colPt);

				colPt = new THREE.Vector3(
					-boxStart,
					boxStart + (j*boxIncrement)
					
				);

				points.push(colPt);
				}
			}
		}*/

		

		/*let points = [[168, 180], [168, 178], [168, 179], [168, 181], [168, 183], [167, 183], [167, 184], [165, 184], [162, 186], [164, 188], [161, 188], [160, 191], [158, 193], [156, 193], [152, 195], [152, 198], [150, 198], [147, 198], [148, 205], [150, 210], [148, 210], [148, 208], [145, 206], [142, 206], [140, 206], [138, 206], [135, 206], [135, 209], [131, 209], [131, 211], [127, 211], [124, 210], [120, 207], [120, 204], [120, 202], [124, 201], [123, 201], [125, 198], [125, 194], [127, 194], [127, 191], [130, 191], [132, 189], [134, 189], [134, 186], [136, 184], [134, 182], [134, 179], [134, 176], [136, 174], [139, 174], [141, 177], [142, 176], [144, 176], [147, 178], [148, 176], [151, 178], [154, 178], [153, 175], [152, 174], [152, 170], [152, 168], [150, 166], [148, 166], [147, 165], [145, 162], [146, 160], [146, 157], [146, 155], [144, 155], [142, 152], [140, 150], [138, 150], [138, 148], [140, 145], [140, 142], [140, 138], [139, 138], [137, 138], [135, 138], [133, 135], [132, 132], [129, 132], [128, 132], [124, 132], [124, 130], [123, 130], [118, 126], [116, 124], [112, 122], [109, 122], [105, 122], [102, 124], [100, 124], [97, 124], [95, 126], [92, 127], [89, 127], [88, 130], [85, 132], [80, 134], [72, 134], [69, 134], [65, 138], [64, 138], [58, 137], [56, 133], [52, 133], [51, 133], [48, 133], [44, 133], [41, 131], [38, 130], [35, 130], [32, 127], [30, 127], [27, 127], [24, 127], [24, 126], [23, 124], [20, 122], [17, 122], [16, 118], [15, 116], [15, 110], [18, 108], [20, 102], [24, 97], [28, 102], [28, 98], [26, 97], [28, 94], [27, 85], [29, 79], [32, 76], [39, 70], [44, 66], [48, 65], [53, 61], [53, 58], [51, 54], [54, 54], [52, 48], [51, 43], [48, 42], [49, 38], [48, 34], [51, 30], [53, 33], [58, 30], [61, 30], [60, 27], [64, 26], [68, 24]];
		*/
		// End result will look like a bunch of boxes with
		// X's through the middle.

		// This will be tessellated by iterating through all
		// the "box" points, connecting with the "cross" points
		// as the boxes are traversed.

		let plane = new THREE.Geometry();

		// Vertices are stored in a 1D array. Each "row" consists of box points
		// or cross points, with rows alternating. Box or cross points
		// can be found with the following indices:
		// box[row][col] = vertices[(row * (2n + 1)) + col]
		// cross[row][col] = vertices[((row+1)*(n+1)) + (row*n) + col]
		let vertices = plane.vertices;
		let faces = plane.faces;

		/*DelTriangulation.reset();

		let triangs = DelTriangulation.triangulate(points);*/

		let delaunay = Delaunator.from(points);
		let triangs = delaunay.triangles;

		// Add the triangles from the generated delaunay triangulation
		// to faces
		let addedVerts = new Map();
		let vertIndex = 0;
		for(let i = 0; i < triangs.length; i+=3){
			//2D versions
			let tPt0 = points[triangs[i]];
			let tPt1 = points[triangs[i+1]];
			let tPt2 = points[triangs[i+2]];
			
			// Cantor hashes of the x and y coordinates for each vertex
			let hash0 = Utils.cantorHash(tPt0[0] + width + 1 - boxStart, tPt0[1] - boxStart) - boxStart + 1,
				hash1 = Utils.cantorHash(tPt1[0] + width + 1 - boxStart, tPt1[1] - boxStart) - boxStart + 1,
				hash2 = Utils.cantorHash(tPt2[0] + width + 1 - boxStart, tPt2[1] - boxStart) - boxStart + 1;
			
			let f0 = vertIndex,
				f1 = vertIndex,
				f2 = vertIndex;
			

			/////CHECK FIRST VERTEX (0)
			// Use the hashes as the keys to each index of a unique vertex
			if(!addedVerts.has(hash0)){
				
				//add the vertex to the Map of hash-indexed vertex indices
				addedVerts.set(hash0, vertIndex);
				
				//add the vertex to the plane's vertices
				let vert = new THREE.Vector3(tPt0[0], tPt0[1], 0)
				vertices.push(vert);
				
				if(vert.x <= boxStart + .5 || vert.x >= -boxStart - .5
					|| vert.y <= boxStart + .5 || vert.y >= -boxStart - .5){
					EdgeVerts.addVert(vertIndex, vertices[vertIndex]);
				}

				//set the index for this point in the face
				f0 = vertIndex;
				vertIndex++;
			}
			else{
				//set the index for this point in the face
				f0 = addedVerts.get(hash0);
			}

			/////CHECK NEXT VERTEX (1)
			// Use the hashes as the keys to each index of a unique vertex
			if(!addedVerts.has(hash1)){
				
				//add the vertex to the Map of hash-indexed vertex indices
				addedVerts.set(hash1, vertIndex);
				
				//add the vertex to the plane's vertices
				let vert = new THREE.Vector3(tPt1[0], tPt1[1], 0)
				vertices.push(vert);
				
				if(vert.x <= boxStart + .5 || vert.x >= -boxStart - .5
					|| vert.y <= boxStart + .5 || vert.y >= -boxStart - .5){
					EdgeVerts.addVert(vertIndex, vertices[vertIndex]);
				}

				//set the index for this point in the face
				f1 = vertIndex;
				vertIndex++;
			}
			else{
				//set the index for this point in the face
				f1 = addedVerts.get(hash1);
			}

			/////CHECK LAST VERTEX (2)
			// Use the hashes as the keys to each index of a unique vertex
			if(!addedVerts.has(hash2)){
				
				//add the vertex to the Map of hash-indexed vertex indices
				addedVerts.set(hash2, vertIndex);
				
				//add the vertex to the plane's vertices
				let vert = new THREE.Vector3(tPt1[0], tPt1[1], 0)
				vertices.push(vert);
				
				if(vert.x <= boxStart + .5 || vert.x >= -boxStart - .5
					|| vert.y <= boxStart + .5 || vert.y >= -boxStart - .5){
					EdgeVerts.addVert(vertIndex, vertices[vertIndex]);
				}

				//set the index for this point in the face
				f2 = vertIndex;
				vertIndex++;
			}
			else{
				//set the index for this point in the face
				f2 = addedVerts.get(hash2);
			}

			faces.push(new THREE.Face3(f0, f1, f2));
		}

		// Add all the unique delaunay points to vertices
		// Hash each pair to ensure no duplicates are added.
		//let addedVerts = new Set();
/*
		for(let i = 0; i < plane.faces.length; i++){
			let v1 = plane.faces[i].a,
				v2 = plane.faces[i].b,
				v3 = plane.faces[i].c;

			let hash1 = Utils.cantorHash(v1[0],v1[1]),
				hash2 = Utils.cantorHash(v2[0],v2[1]),
				hash3 = Utils.cantorHash(v3[0],v3[1]);

			if(!addedVerts.has(hash1)){
				vertices.push(new THREE.Vector3(v1[0],v1[1],0));
				addedVerts.add(hash1);
			}

			if(!addedVerts.has(hash2)){
				vertices.push(new THREE.Vector3(v2[0],v2[1],0));
				addedVerts.add(hash2);
			}

			if(!addedVerts.has(hash3)){
				vertices.push(new THREE.Vector3(v3[0],v3[1],0));
				addedVerts.add(hash3);
			}
		}
*/
		/*let boxStart = 0 - (width / 2),
			boxIncrement = (width / levels)
			crossStart = boxStart + (boxIncrement / 2);

		/*
		// Generate points
		for(let i = 0; i < levels + 1; i++){

			// Create row of box points
			for(let j = 0; j < levels + 1; j++){

				let boxPt = new THREE.Vector3(
					boxStart + (j*boxIncrement),
					boxStart + (i*boxIncrement),
					0
				);

				vertices.push(boxPt);

			}

			// Create row of cross points, if not at top level.
			if(i!=levels){
				for(let j = 0; j < levels; j++){

						let crossPt = new THREE.Vector3(
							crossStart + (j*boxIncrement),
							crossStart + (i*boxIncrement),
							0
						);

						vertices.push(crossPt);
				}
			}
		}

		// Helpers to get indices easily
		let boxIndex = function(row, col){ return (row * (2*levels + 1)) + col; };
		let crossIndex = function(row, col){ return ((row+1)*(levels+1)) + (row*levels) + col; };

		// Generate faces
		for(let i = 0; i < levels; i++){
			for(let j = 0; j < levels; j++){

				// Get all 5 points in current box
				let b1 = Plane.boxIndex(i,j,levels),
					b2 = Plane.boxIndex(i,j+1,levels),
					b3 = Plane.boxIndex(i+1,j,levels),
					b4 = Plane.boxIndex(i+1,j+1,levels),
					cross = Plane.crossIndex(i,j,levels);

				// Create all possible faces from these
				faces.push(new THREE.Face3(b1,b2,cross));
				faces.push(new THREE.Face3(b2,b4,cross));
				faces.push(new THREE.Face3(b4,b3,cross));
				faces.push(new THREE.Face3(b3,b1,cross));
			}
		}
		*/
		return plane;
	},

	/*
	Helper to get index for a 1D array holding vertices for a custom
	tesselated plane. A "box" verticy refers to a point lying on the edge of
	one of the squares.

	@param tessLevels Levels of tesselation on the plane. Determines size of a row
	*/
	boxIndex(row, col, tessLevels){
		return (row * (2*tessLevels + 1)) + col;
	},

	/*
	Helper to get index for a 1D array holding vertices for a custom
	tesselated plane. A "cross" verticy refers to a point lying within a square,
	at the center of an X.

	@param tessLevels Levels of tesselation on the plane. Determines size of a row

	@return Index of where (row,col) will be in a 1D array
	*/
	crossIndex(row, col, tessLevels){
		return ((row+1)*(tessLevels+1)) + (row*tessLevels) + col;
	},

	/*
	Convert 1D array index to column of tesselated plane.
	*/
	getBoxColumn(index, tessLevels){
		return index % ((2*tessLevels) + 1);
	},

	/*
	Convert 1D array index to row of tesselated plane.
	*/
	getBoxRow(index, tessLevels){
		return Math.floor(index / ((2*tessLevels)+1));
	},

	/*
	Determine if current index of 1D points is on the edge of the plane.

	Reverse engineers row and column from 1D index to determine this.

	@return True if point is on edge of plane
	*/
	isPointOnEdgeOfPlane(index, tessLevels){
		let row = Plane.getBoxRow(index, tessLevels);
		let col = Plane.getBoxColumn(index, tessLevels);

		//If column greater than levels of tesselation,
		//point is a cross point and can't be on edge of plane
		if(col > tessLevels) return false;

		return row==0 || row==tessLevels || col==0 || col==tessLevels;
	}

	/*disPointOnEdgeOfPlane(){
		
	}*/
}
