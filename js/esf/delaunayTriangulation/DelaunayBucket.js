/**
 * This bucket acts as a typical face in a DCEL, but also has a list of points
 * that the triangle contains.
 */
class DelaunayBucket{

    /** 
     * Constructor of a delaunay bucket
     * 
     * @param a this is the new point that is being introduced to the triangulation. 
     * This is in the form of its index from the overall allSites list.
     * @param b one of the points already in the DT. 
     * This is in the form of its index from the overall allSites list.
     * @param c one of the points already in the DT. 
     * This is in the form of its index from the overall allSites list.
     * @param index this is the index of the triangle in allTriangles.
     */
    constructor(a, b, c, index){
        if (Utils.determinant(a,b,c) <= 0){
            throw "DelTriangulation should have taken care of this! This is not in counterclockwise order.";
        }
        
        this.containedPoints = [];
        this.a = a;
        this.b = b;
        this.c = c;
        this.id = index;
        this.firstHedge = null;
    }

    addPoint(p){
        this.containedPoints.push(p);
    }

    assignHalfEdges(){
        //Create the halfedges for this face.
        
        // Cantor hash the vertices' indices
        let hashAB = Utils.cantorHash(this.a,this.b);
        let hashBC = Utils.cantorHash(this.b,this.c);
        let hashCA = Utils.cantorHash(this.c,this.a);

        let bc = null;
        let ca = null;

        if(!DelTriangulation.allEdges.has(hashAB)){
            this.firstHedge = new DelaunayHedge(this.a, this.b);
            this.firstHedge.setTwins();
            DelTriangulation.allEdges.set(hashAB, [this.firstHedge, 
                this.firstHedge.twin]);
        }
        else{
            let abEdge = DelTriangulation.allEdges.get(hashAB);
            if(abEdge[0].origin === this.a){
                this.firstHedge = abEdge[0];
            }
            else if (abEdge[1].origin === this.a) {
                this.firstHedge = abEdge[1];
            }
        }
        this.firstHedge.setIncidentFace(this.id);


        if(!DelTriangulation.allEdges.has(hashBC)){
            bc = new DelaunayHedge(this.b, this.c);
            bc.setTwins();
            DelTriangulation.allEdges.set(hashBC, [bc, bc.twin]);
        }
        else{
            let bcEdge = DelTriangulation.allEdges.get(hashBC);
            if (bcEdge[0].origin === this.b){
                bc = bcEdge[0];
            }
            else if(bcEdge[1].origin === this.b){
                bc = bcEdge[1];
            }
        }
        bc.setIncidentFace(this.id);


        if(!DelTriangulation.allEdges.has(hashCA)){
            ca = new DelaunayHedge(this.c, this.a);
            ca.setTwins();
            DelTriangulation.allEdges.set(hashCA, [ca, ca.twin]);
        }
        else{
            let caEdge = DelTriangulation.allEdges.get(hashCA);
            if (caEdge[0].origin === this.c){
                ca = caEdge[0];
            }
            else if(caEdge[1].origin === this.c){
                ca = caEdge[1];
            }
        }
        ca.setIncidentFace(this.id);


        this.firstHedge.setNext(bc);
        bc.setNext(ca);
        ca.setNext(this.firstHedge);
    }
}