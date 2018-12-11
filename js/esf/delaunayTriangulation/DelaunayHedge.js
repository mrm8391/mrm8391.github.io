class DelaunayHedge{

    constructor(a, b){
        this.origin = a;
        this.end = b;
        this.twin = null;
        this.incidentFace = null;
        this.nextHedge = null;
    }

    setTwins(){
        this.twin = new DelaunayHedge(this.end, this.origin);
        this.twin.twin = this;
    }

    //Incident Face is just the index of the face
    setIncidentFace(f){
        this.incidentFace = f;
    }
    
    //This is an actual reference to the next hedge
    setNext(h){
        this.nextHedge = h;
    }
}