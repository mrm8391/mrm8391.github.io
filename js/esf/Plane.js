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
		

		
		// End result will be a delaunay triangulated surface.

		// This will be tessellated by iterating through all
		// the "delaunay" points.

		let plane = new THREE.Geometry();

		// Vertices and faces are stored in 1D arrays.
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
