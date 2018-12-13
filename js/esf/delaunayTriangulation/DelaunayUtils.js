var DelaunayUtils = {
    //inCircle
    inCircle(a, b, c, d){
        let determ = 
            a[0] * DelaunayUtils.determinant3x3(
                [b[1], Math.pow(b[0], 2) + Math.pow(b[1], 2), 1],
                [c[1], Math.pow(c[0], 2) + Math.pow(c[1], 2), 1],
                [d[1], Math.pow(d[0], 2) + Math.pow(d[1], 2), 1]
            )
            - a[1] * DelaunayUtils.determinant3x3(
                [b[0], Math.pow(b[0], 2) + Math.pow(b[1], 2), 1],
                [c[0], Math.pow(c[0], 2) + Math.pow(c[1], 2), 1],
                [d[0], Math.pow(d[0], 2) + Math.pow(d[1], 2), 1]
            )
            + (Math.pow(a[0], 2) + Math.pow(a[1], 2)) * DelaunayUtils.determinant3x3(
                [b[0], b[1], 1],
                [c[0], c[1], 1],
                [d[0], d[1], 1]
            )
            - 1 * DelaunayUtils.determinant3x3(
                [b[0], b[1], (Math.pow(b[0], 2) + Math.pow(b[1], 2))],
                [c[0], c[1], (Math.pow(c[0], 2) + Math.pow(c[1], 2))],
                [d[0], d[1], (Math.pow(d[0], 2) + Math.pow(d[1], 2))]
            )
        ;
        if(determ > 0){
            return true;
        }
        else{
            return false;
        }
    },

    determinant3x3(row1, row2, row3){
        let determ = (      row1[0] * row2[1] * row3[2]
                        +   row1[1] * row2[2] * row3[0]
                        +   row1[2] * row2[0] * row3[1] )

                    - (     row3[0] * row2[1] * row1[2]
                        +   row3[1] * row2[2] * row1[0]
                        +   row3[2] * row2[0] * row1[1] );

        return determ;
    },

    //onTriangle
    //If the new point lies on an edge of the triangle, return:
    //  1 if that edge is ab
    //  2 if that edge is bc
    //  3 if that edge is ca
    //Return -1 if the new point is not on any edge.
    onTriangle(a, b, c, p){
        if(Utils.determinant(a, b, p) === 0){
            return 1;
        }
        else if(Utils.determinant(b, c, p) === 0){
            return 2;
        }
        else if(Utils.determinant(c, a, p) === 0){
            return 3;
        }
        else{
            return -1;
        }
    },

    /**
     * d is the new point
     * @param {*} a 
     * @param {*} b 
     * @param {*} c 
     * @param {*} d 
     */
    inTriangle(a, b, c, d){
        //For now, just get rid of ontriangle points
        if(Utils.determinant(a, b, d) > 0 
        && Utils.determinant(b, c, d) > 0
        && Utils.determinant(c, a, d) > 0){
            return true;
        }
        else{
            return false;
        }
    }

}