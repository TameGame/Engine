/// <reference path="Shape.ts" />

module TameGame {
    /**
     * Interface implemented by shapes that are a polygon
     */
    export interface PolygonShape extends SatShape {
        /** Retrieves the vertices making up this polygon */
        getVertices(): Point2D[];
    }
    
    function getBoundingBox(vertices: Point2D[]): BoundingBox {
        if (vertices.length <= 0) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        
        var minX, minY, maxX, maxY;
        
        minX = vertices[0].x;
        minY = vertices[0].y;
        maxX = minX;
        maxY = minY;
        
        vertices.slice(1).forEach((vertex) => {
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.y < minY) minY = vertex.y;
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.y > maxY) maxY = vertex.y;
        });
        
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    
    function getAxes(vertices: Point2D[]): Point2D[] {
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
    
    function projectOntoAxis(vertices: Point2D[], axis: Point2D): Projection {
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
    
    /**
     * A polygon with a transformation
     */
    class TransformedPolygon implements PolygonShape {
        constructor(initVertices: Point2D[], initCenter: Point2D, matrix: number[]) {
            var vertices: Point2D[];
            
            var getVertices = () => {
                vertices = initVertices.map((vertex) => transform(matrix, vertex));
                getVertices = () => vertices;
                return vertices;
            };
            
            var center = transform(matrix, initCenter);

            this.getCenter          = () => center;
            this.getAxes            = () => getAxes(getVertices());
            this.projectOntoAxis    = (axis) => projectOntoAxis(getVertices(), axis);
            this.transform          = (transformMatrix) => new TransformedPolygon(initVertices, center, multiplyMatrix(matrix, transformMatrix));
            this.getVertices        = () => getVertices();
            this.getBoundingBox     = () => {
                var boundingBox = getBoundingBox(getVertices());
                this.getBoundingBox = () => boundingBox;
                return boundingBox;
            };
        }
        
        /** Returns a transformed version of this shape */
        transform: (matrix: number[]) => Shape;
        
        /** The axes to test (the normals of this shape) */
        getAxes: () => Point2D[];
        
        /** The center of this shape */
        getCenter: () => Point2D;
        
        /** Projects the points of this shape onto the specified axis */
        projectOntoAxis: (axis: Point2D) => Projection;
        
        /** Retrieves the vertices making up this polygon */
        getVertices: () => Point2D[];

        /** Retrieves the bounding box for this shape */
        getBoundingBox: () => BoundingBox;
    }
    
    /**
     * A shape that is a polygon
     */
    export class Polygon implements PolygonShape {
        /**
         * Creates a polygon with the specified vertices
         */
        constructor(initVertices: Point2D[]) {
            if (!initVertices || initVertices.length < 3) {
                throw "A polygon must have at least 3 sides";
            }
            
            // The center is at the average of all the vertices
            var center = { x: 0, y: 0 };
            initVertices.forEach((vertex) => { center.x += vertex.x; center.y += vertex.y });
            
            center.x /= initVertices.length;
            center.y /= initVertices.length;
            
            // Make a copy of the vertices in case the caller tries to modify them
            var numVertices = initVertices.length;
            var vertices    = initVertices.map((vertex) => { return { x: vertex.x, y: vertex.y } });
            
            // Create the functions
            this.getCenter          = () => { return center; };
            this.getAxes            = () => getAxes(vertices);
            this.projectOntoAxis    = (axis) => projectOntoAxis(vertices, axis);
            this.transform          = (matrix) => new TransformedPolygon(vertices, center, matrix);
            this.getVertices        = () => vertices;
            this.getBoundingBox     = () => {
                var boundingBox = getBoundingBox(vertices);
                this.getBoundingBox = () => boundingBox;
                return boundingBox;
            };
        }
        
        /** Returns a transformed version of this shape */
        transform: (matrix: number[]) => Shape;
        
        /** The axes to test (the normals of this shape) */
        getAxes: () => Point2D[];
        
        /** The center of this shape */
        getCenter: () => Point2D;
        
        /** Projects the points of this shape onto the specified axis */
        projectOntoAxis: (axis: Point2D) => Projection;
        
        /** Retrieves the vertices making up this polygon */
        getVertices: () => Point2D[];

        /** Retrieves the bounding box for this shape */
        getBoundingBox: () => BoundingBox;
    }
}
