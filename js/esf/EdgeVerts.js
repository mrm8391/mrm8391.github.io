var EdgeVerts = {
    edgePoints: new Map(),

    addVert(index, vertexPtr){
        EdgeVerts.edgePoints.set(index, vertexPtr);
    },
    
    getVert(index){
        return vertexPtr;
    },

    hasVert(index){
        return EdgeVerts.edgePoints.has(index);
    },

    edgeVertsList(){
        return EdgeVerts.edgePoints.values();
    }
}