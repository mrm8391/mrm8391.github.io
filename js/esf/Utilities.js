/*
Miscellaneous utility functions.
*/

var Utils = {
	//https://en.wikipedia.org/wiki/Pairing_function#Cantor_pairing_function
	cantorHash(v1,v2){
		// Sort to account for either order of points
		if(v1 >= v2){
			let temp = v1;
			v1 = v2;
			v2 = temp;
		}

		return 0.5 * (v1 + v2) * (v1 + v2 + 1) + v2;
	},

	/**	This provides the determinant of three 2D points. 
		If positive, they are in counterclockwise order/p is to the left of qr, 
		if negative, they are in clockwise order/p is to the right of qr,
		if 0, they are collinear.

		@param p the first point in the triangle
		@param q the second point in the triangle
		@param r the third point in the triangle, either 
				on the line formed by p ->q, to its left, or to its right
	*/
	determinant(p, q, r){
		return (p[0]*q[1] + q[0]*r[1] + r[0]*p[1]
            - p[1]*q[0] - q[1]*r[0] - r[1]*p[0]);
	},

	/*
	Utility function for disposing of threejs resources in a scene.

	Function is a collaborative effort from several users on this post:
	https://stackoverflow.com/questions/33152132/three-js-collada-whats-the-proper-way-to-dispose-and-release-memory-garbag/33199591#33199591
	*/
	disposeNode(parentObject) {
		parentObject.traverse(function(node) {
			if (node instanceof THREE.Mesh) {
				if (node.geometry) {
					node.geometry.dispose();
				}
				if (node.material) {
					var materialArray;
					if (node.material instanceof THREE.MeshFaceMaterial || node.material instanceof THREE.MultiMaterial) {
						materialArray = node.material.materials;
					} else if (node.material instanceof Array) {
						materialArray = node.material;
					}
					if (materialArray) {
						materialArray.forEach(function(mtrl, idx) {
							if (mtrl.map) mtrl.map.dispose();
							if (mtrl.lightMap) mtrl.lightMap.dispose();
							if (mtrl.bumpMap) mtrl.bumpMap.dispose();
							if (mtrl.normalMap) mtrl.normalMap.dispose();
							if (mtrl.specularMap) mtrl.specularMap.dispose();
							if (mtrl.envMap) mtrl.envMap.dispose();
							mtrl.dispose();
						});
					} else {
						if (node.material.map) node.material.map.dispose();
						if (node.material.lightMap) node.material.lightMap.dispose();
						if (node.material.bumpMap) node.material.bumpMap.dispose();
						if (node.material.normalMap) node.material.normalMap.dispose();
						if (node.material.specularMap) node.material.specularMap.dispose();
						if (node.material.envMap) node.material.envMap.dispose();
						node.material.dispose();
					}
				}
			}
		});
	},

	disposeHierarchy(node, callback) {
		for (var i = node.children.length - 1; i >= 0; i--) {
			var child = node.children[i];
			Utils.disposeHierarchy(child, callback);
			callback(child);
		}
	}
};