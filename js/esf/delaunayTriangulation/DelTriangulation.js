var DelTriangulation = {
    //DCEL? yes
    //dcel = new DCEL(),

    //Uses the incremental construction algorithm
    
    /**
     * Start with a sufficiently large triangle that contains all the points in the set.
     * In this case, that is the triangle that's nearly a tight bound around the plane space. 
     * The point that would normally be on the lower left corner of the plane square is 
     * offset by one unit below and one unit left, as to make deletion later easier/to 
     * include the actual corner at that point.
    */
    boundingTriangle: 
            //these points are not within the main plane bounds, 
            //so they should not be added to the list of final triangles.
            [[-CONF.planeWidth/2 - 1, -CONF.planeWidth/2 - 1],
            [CONF.planeWidth * 1.5 + 1, -CONF.planeWidth/2 - 1],
            [-CONF.planeWidth/2 - 1, CONF.planeWidth * 1.5 + 1]],

    //For the purposes of this implementation of a DCEL, for Delaunay Triangulation,
    //sites are simply in the form [x,y] and do not contain any other data or metadata
    allSites:  [],

    //Map of key (site index) value (bucket location)
    siteLocations: new Map(),

    //list of sites left in the triangulation (most cocircular sites are removed)
    delaunaySites: [],

    //the list of all the triangles. This is a map because the triangles are 
    //frequently added and removed
    allBuckets: [],

    //finalized list of triangles in the form 
    //      [[a1.x, a1.y], [b1.x, b1.y], [c1.x, c1. y], 
    //      [a2.x, a2.y], ..., [an.x, an.y], [bn.x, bn.y], [cn.x, cn.y]]
    delaunayTriangles: [],

    //Note that whenever a new edge is introduced, the only time an old edge is removed is when
    //edge flipping is performed. This is an edge list instead of a halfedge list because 
    //the keys are determined by cantor hashing the indices. While this gives a unique number
    //for a pair of numbers, order is not considered with cantor hash.
    //This is in the format 
    //      key (cantor hash of vertex indices), 
    //      value ([DelaunayHedge0, DelaunayHedge1])
    allEdges: new Map(),

    reset(){
        DelTriangulation.allSites = [];
        DelTriangulation.siteLocations = new Map();
        DelTriangulation.delaunaySites = [];
        DelTriangulation.allBuckets = [];
        DelTriangulation.delaunayTriangles = [];
        DelTriangulation.allEdges = new Map();
    },

    //createDT removes cocircular points, returns the internal DCEL
    //map the DT to the open source functions and their returns
    triangulate(sites){

        //This is a Set to avoid repeted sites in the list
        let addedSites = new Set();

        DelTriangulation.allSites.push(
            DelTriangulation.boundingTriangle[0], 
            DelTriangulation.boundingTriangle[1], 
            DelTriangulation.boundingTriangle[2]);
        
        let boundBucket = new DelaunayBucket(0, 1, 2, 0);
        //DelTriangulation.allBuckets.push(boundBucket);
        boundBucket.assignHalfEdges();
        
        for(let v = 0; v < DelTriangulation.boundingTriangle.length; v++){
            addedSites.add();
            let hashPt = Utils.cantorHash(
                DelTriangulation.boundingTriangle[v][0] + CONF.planeWidth + 1 + CONF.planeWidth/2, 
                DelTriangulation.boundingTriangle[v][1] + CONF.planeWidth/2) 
                + CONF.planeWidth/2 + 1;
                addedSites.add(hashPt);
                DelTriangulation.siteLocations.set(v, -1);
        }


        //v should be in the form [x, y]
        for(let v = 0; v < sites.length; v++){
            let hashPt = Utils.cantorHash(
                sites[v][0] + CONF.planeWidth + 1 + CONF.planeWidth/2, 
                sites[v][1] + CONF.planeWidth/2) 
                + CONF.planeWidth/2 + 1;

            //Don't add any sites that already in the list of sites
            if(!addedSites.has(hashPt)){
                addedSites.add(hashPt);
                DelTriangulation.allSites.push(sites[v]);
                boundBucket.addPoint(v + 3);
                DelTriangulation.siteLocations.set(v + 3, boundBucket.id);
            } //else ignore that point
        }

        //For later return of triangles, skip any triangle that contains 
        //a boundBucket vertex
        DelTriangulation.allBuckets.push(boundBucket);

        //DelTriangulation.subTriangulate(boundBucket);

        for(let v = 3; v < DelTriangulation.allSites.length; v++){
            DelTriangulation.subTriangulate(v);
        }

        DelTriangulation.finalizeTriangles();
        return DelTriangulation.delaunayTriangles;
    },

    //Insert
    subTriangulate(vIndex){
        siteLoc = DelTriangulation.siteLocations.get(vIndex);
        if(siteLoc >= 0){
            //let vIndex = Math.floor(Math.random() * triang.containedPoints.length);
            let newSite = DelTriangulation.allSites[vIndex];
            let triang = DelTriangulation.allBuckets[DelTriangulation.siteLocations.get(vIndex)];

            //if the point is on the edge of a triangle, replace the two incident 
            //faces of that edge with new 4 triangles. SwapTest each of these 
            //new triangles

            //If this point is just inside, do the normal insertion
            if(DelaunayUtils.onTriangle(
                DelTriangulation.allSites[triang.a], 
                DelTriangulation.allSites[triang.b], 
                DelTriangulation.allSites[triang.c], 
                newSite) < 0)
            {
                //Add the new site to the final list of sites/vertices
                DelTriangulation.delaunaySites.push(newSite);

                let pab = new DelaunayBucket(vIndex, triang.a, triang.b, triang.id);
                //set the original bucket's value to that of the first new one
                DelTriangulation.allBuckets[triang.id] = pab;
                pab.assignHalfEdges();

                let pbc = new DelaunayBucket(vIndex, triang.b, triang.c, 
                    DelTriangulation.allBuckets.length);
                DelTriangulation.allBuckets.push(pbc);
                pbc.assignHalfEdges();

                let pca = new DelaunayBucket(vIndex, triang.c, triang.a, 
                    DelTriangulation.allBuckets.length);
                DelTriangulation.allBuckets.push(pca);
                pca.assignHalfEdges();

                DelTriangulation.rebucket3(triang, pab, pbc, pca);
                DelTriangulation.swapTest(pab);
                DelTriangulation.swapTest(pbc);
                DelTriangulation.swapTest(pca);
            }
        }
    },

    swapTest(pab){
        ab = pab.firstHedge.nextHedge;
        //ab is NOT part of the convex hull of the triangulation
        if(!(ab.twin.incidentFace === null)){
            d = ab.twin.nextHedge.end;
            if(DelaunayUtils.inCircle(
                DelTriangulation.allSites[pab.a],
                DelTriangulation.allSites[pab.b],
                DelTriangulation.allSites[pab.c],
                DelTriangulation.allSites[d]))
            {
                DelTriangulation.edgeFlip(ab, pab, d);
            }
        }
    },

    /**
     * 
     * @param {DelaunayEdge} ab 
     * @param {DelaunayBucket} pab
     */
    edgeFlip(ab, pab, d){
        p = pab.a;
        //d is already a parameter

        padID = pab.id;
        pdbID = ab.twin.incidentFace;

        let pad = new DelaunayBucket(p, ab.origin, d, padID);
        pad.assignHalfEdges();
        let pdb = new DelaunayBucket(p, d, ab.end, pdbID);
        pdb.assignHalfEdges();

        // Rebucket first
        DelTriangulation.rebucket2(pab, DelTriangulation.allBuckets[pdbID],
            pad, pdb);

        // Then reassign the indices to the new triangles (2 for 2)
        DelTriangulation.allBuckets[padID] = pad;
        DelTriangulation.allBuckets[pdbID] = pdb;
        
        DelTriangulation.swapTest(pad);
        DelTriangulation.swapTest(pdb);
    },

    /**
     * 
     * @param {DelaunayBucket} pab one of the original faces
     * @param {DelaunayBucket} dba one of the original faces
     * @param {DelaunayBucket} pad one of the new faces
     * @param {DelaunayBucket} pdb one of the new faces
     */
    rebucket2(pab, dba, pad, pdb){
        for(let v = pab.containedPoints.length - 1; v >= 0; v--){
            let point = pab.containedPoints[v];
            if(DelaunayUtils.inTriangle(
                DelTriangulation.allSites[pad.a],
                DelTriangulation.allSites[pad.b],
                DelTriangulation.allSites[pad.c],
                DelTriangulation.allSites[point]
            ))
            {
                pad.addPoint(point);
                DelTriangulation.siteLocations.set(point, pad.id);
            }
            // For now, remove ontriangle sites
            else if(DelaunayUtils.inTriangle(
                DelTriangulation.allSites[pdb.a],
                DelTriangulation.allSites[pdb.b],
                DelTriangulation.allSites[pdb.c],
                DelTriangulation.allSites[point]
            )){
                pdb.addPoint(point);
                DelTriangulation.siteLocations.set(point, pdb.id);
            }
            else{
                DelTriangulation.siteLocations.set(point, -1);
            }

            //Remove the point from the old triangle's list
            pab.containedPoints.pop();
        }
        
        for(let v = dba.containedPoints.length - 1; v >= 0; v--){
            let point = dba.containedPoints[v];
            if(DelaunayUtils.inTriangle(
                DelTriangulation.allSites[pad.a],
                DelTriangulation.allSites[pad.b],
                DelTriangulation.allSites[pad.c],
                DelTriangulation.allSites[point]
            ))
            {
                pad.addPoint(point);
                DelTriangulation.siteLocations.set(point, pad.id);
            }
            else if(DelaunayUtils.inTriangle(
                DelTriangulation.allSites[pdb.a],
                DelTriangulation.allSites[pdb.b],
                DelTriangulation.allSites[pdb.c],
                DelTriangulation.allSites[point]
            )){
                pdb.addPoint(point);
                DelTriangulation.siteLocations.set(point, pdb.id);
            }
            else{
                DelTriangulation.siteLocations.set(point, -1);
            }

            //Remove the point from the old triangle's list
            dba.containedPoints.pop();
        }
    },

    /**
     * 
     * @param {*} abc 
     * @param {*} pab 
     * @param {*} pbc 
     * @param {*} pca 
     */
    rebucket3(abc, pab, pbc, pca){
        for(let v = abc.containedPoints.length - 1; v >= 0; v--){
            let p = abc.containedPoints[v];


            if(DelaunayUtils.inTriangle(
                DelTriangulation.allSites[pab.a], 
                DelTriangulation.allSites[pab.b], 
                DelTriangulation.allSites[pab.c], 
                DelTriangulation.allSites[p]
            ))
            {
                pab.addPoint(p);
                DelTriangulation.siteLocations.set(p, pab.id);
            }
            else if(DelaunayUtils.inTriangle(
                DelTriangulation.allSites[pbc.a], 
                DelTriangulation.allSites[pbc.b], 
                DelTriangulation.allSites[pbc.c], 
                DelTriangulation.allSites[p]))
            {
                pbc.addPoint(p);
                DelTriangulation.siteLocations.set(p, pbc.id);
            }
            else
            {
                pca.addPoint(p);
                DelTriangulation.siteLocations.set(p, pca.id);
            }

            //Remove the point from the old triangle's list
            abc.containedPoints.pop();
        }
    },

    /**
     * Later on, change this to exclude any triangles that has a boundbucket point in it
     */
    finalizeTriangles(){
        for(let t of DelTriangulation.allBuckets){
            let a = DelTriangulation.allSites[t.a];
            let b = DelTriangulation.allSites[t.b];
            let c = DelTriangulation.allSites[t.c];

            DelTriangulation.delaunayTriangles.push(
                [a[0], a[1]],
                [b[0], b[1]],
                [c[0], c[1]]
            )
        }
    }
}