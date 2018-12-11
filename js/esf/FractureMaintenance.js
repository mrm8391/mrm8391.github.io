/* This contains maps for key-value pairs:
    

    particle: vertIndex

    ///You must delete the spring force dependency from each particle
    spring: particles
    
    spring: faceIndices

    */
var FractureMaintenance = {
    spring_faceIndices = new Map(),

    addFaces(springInd, faceInd){
        if(!this.spring_faceIndices.has(springInd)){
            this.spring_faceIndices.set(springInd, [faceInd, -1]);
        }
        else if(this.spring_faceIndices[springInd][1] === -1){
            this.spring_faceIndices[springInd][1] = faceInd;
        }
    }
}