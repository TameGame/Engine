/// <reference path="Shape.ts" />
/// <reference path="../Algorithms/Algorithms.ts" />

module TameGame {
    "use strict";

    /**
     * Represents a circle shape, supporting collision detection throught the SAT algorithm
     *
     * One limitation of this implementation is that it does not support transformations other than translations, rotations and scaling
     * (ie, it only works correctly for transformations that leave the circle circular)
     */
    export class Circle implements SatShape {
        /**
         * Creates a circle at the given position
         */
        constructor(center: Point2D, radius: number) {
            var cX = center.x;
            var cY = center.y;

            // Creates a transformed circle
            var cTransform = (matrix: number[]) => {
                // Calculate the new center and a point on the transformed circle
                var newCenter   = transform(matrix, { x: cX, y: cY });
                var newEdge     = transform(matrix, { x: cX+radius, y: cY });

                // Use the new point to work out the radius of the new circle (assumes it's a circle and not an ellipse)
                var newRadius   = distance(newCenter, newEdge);

                // Generate the new circle object
                return new Circle(newCenter, newRadius);
            }

            // Returns the bounding box of this circle
            var cGetBoundingBox = () => {
                return { x: cX - radius, y: cY - radius, width: radius*2, height: radius*2 };
            }

            // Retrieves the center of this circle
            var cGetCenter = () => { return { x: cX, y: cY }; }

            // Projects this circle onto an axis
            var cProjectOntoAxis = (axis: Point2D) => {
                var mag = magnitude(axis);

                // Project the center point
                var center = dot(axis, { x: cX, y: cY });

                // All projections are the same
                return { min: center-radius*mag, max: center+radius*mag };
            }

            // Works out the closest point on the circle to a particular point
            var cClosestPoint = (point: Point2D) => {
                // Vector to the center of the circle
                var vX = point.x - cX;
                var vY = point.y - cY;

                // Distance to the center of the circle
                var dist = Math.sqrt(vX*vX + vY*vY);

                // Closest point relative to the distance
                return { 
                    x: cX + (vX/dist)*radius,
                    y: cY + (vY/dist)*radius
                };
            }

            /** The axes to test (the normals of this shape) */
            var cGetAxes = (testShape: SatShape) => {
                // One axis: between the circle and the closest point on the target shape
                var closestPoint = testShape.closestPoint({ x: cX, y: cY });

                return [
                    { 
                        x: closestPoint.x - cX,
                        y: closestPoint.y - cY
                    }
                ];
            };

            // Set up this object
            this.transform          = cTransform;
            this.getBoundingBox     = cGetBoundingBox;
            this.getCenter          = cGetCenter;
            this.getAxes            = cGetAxes;
            this.projectOntoAxis    = cProjectOntoAxis;
            this.closestPoint       = cClosestPoint;
        }

        /** Returns a transformed version of this shape */
        transform: (matrix: number[]) => Shape;
        
        /** Retrieves the bounding box for this shape */
        getBoundingBox: () => BoundingBox;
        
        /** Finds the center of this shape */
        getCenter: () => Point2D;

        /** The axes to test (the normals of this shape) */
        getAxes: (testShape: SatShape) => Point2D[];
        
        /** Projects the points of this shape onto the specified axis */
        projectOntoAxis: (axis: Point2D) => Projection;

        /** The closest point on this shape to the specified point */
        closestPoint: (point: Point2D) => Point2D;
    }
}