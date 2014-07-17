/// <reference path="Shape.ts" />

module TameGame {
    /**
     * A polygon with a transformation
     */
    class TransformedPolygon implements SatShape {
        constructor(initVertices: Point2D[], matrix: Float32Array) {
            var vertices: Point2D[];
            
            var getVertices = () => {
                vertices = initVertices.map((vertex) => transform(matrix, vertex));
                getVertices = () => vertices;
                return vertices;
            };

            this.getAxes = () => {
                var vertices = getVertices();
                var numVertices = vertices.length;
                return vertices.map((vertex, index) => {
                    var nextIndex = index + 1;
                    if (nextIndex >= numVertices) nextIndex = 0;
                    
                    var nextVertex = vertices[nextIndex];
                    
                    // Compute the vector between vertices
                    var vector = { x: nextVertex.x - vertex.x, y: nextVertex.y - vertex.y };
                    
                    // Return the normal (the unnormalised normal, in fact)
                    return { x: -vector.y, y: vector.x };
                });
            }

            this.projectOntoAxis = (axis) => {
                var vertices = getVertices();
                var numVertices = vertices.length;
                
                // Initial value is the projection of the first vertex
                var min = dot(axis, vertices[0]);
                var max = min;
                
                // Pick the max/min points
                for (var index=1; index<numVertices; ++index) {
                    var projection = dot(axis, vertices[index]);
                    
                    if (projection < min) {
                        min = projection;
                    } else if (projection > max) {
                        max = projection;
                    }
                }
                
                return { min: min, max: max };
            }
            
            this.transform = (transformMatrix) => new TransformedPolygon(initVertices, multiplyMatrix(matrix, transformMatrix));
        }
        
        /** Returns a transformed version of this shape */
        transform: (matrix: Float32Array) => Shape;
        
        /** The axes to test (the normals of this shape) */
        getAxes: () => Point2D[];
        
        /** Projects the points of this shape onto the specified axis */
        projectOntoAxis: (axis: Point2D) => Projection;
    }
    
    /**
     * A shape that is a polygon
     */
    export class Polygon implements SatShape {
        /**
         * Creates a polygon with the specified vertices
         */
        constructor(initVertices: Point2D[]) {
            if (!initVertices || initVertices.length < 3) {
                throw "A polygon must have at least 3 sides";
            }
            
            // Make a copy of the vertices in case the caller tries to modify them
            var numVertices = initVertices.length;
            var vertices    = initVertices.map((vertex) => { return { x: vertex.x, y: vertex.y } });
            
            // Create the functions
            this.getAxes = () => {
                return vertices.map((vertex, index) => {
                    var nextIndex = index + 1;
                    if (nextIndex >= numVertices) nextIndex = 0;
                    
                    var nextVertex = vertices[nextIndex];
                    
                    // Compute the vector between vertices
                    var vector = { x: nextVertex.x - vertex.x, y: nextVertex.y - vertex.y };
                    
                    // Return the normal (the unnormalised normal, in fact)
                    return { x: -vector.y, y: vector.x };
                });
            }
            
            this.projectOntoAxis = (axis) => {
                // Initial value is the projection of the first vertex
                var min = dot(axis, vertices[0]);
                var max = min;
                
                // Pick the max/min points
                for (var index=1; index<numVertices; ++index) {
                    var projection = dot(axis, vertices[index]);
                    
                    if (projection < min) {
                        min = projection;
                    } else if (projection > max) {
                        max = projection;
                    }
                }
                
                return { min: min, max: max };
            }
            
            this.transform = (matrix) => new TransformedPolygon(vertices, matrix);
        }
        
        /** Returns a transformed version of this shape */
        transform: (matrix: Float32Array) => Shape;
        
        /** The axes to test (the normals of this shape) */
        getAxes: () => Point2D[];
        
        /** Projects the points of this shape onto the specified axis */
        projectOntoAxis: (axis: Point2D) => Projection;
    }
}
