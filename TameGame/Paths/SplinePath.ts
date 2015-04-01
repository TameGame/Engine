/// <reference path="Interface.ts" />
/// <reference path="SplineUtils.ts" />

module TameGame {
    interface SplineFn {
        (pos: number): Point2D;
    }

    /**
     * Represents a curved path following a Catmull-Rom spline
     */
    export class SplinePath implements Path {
        /**
         * Creates a spline path from the specified points.
         *
         * The path will pass through every point except the first and the last (which are used to determine the initial angles)
         */
        constructor(points: Point2D[]) {
            // Generate the spline functions for each segment of the curve
            var pointFns: SplineFn[] = [];

            for (var x=1; x<points.length-2; ++x) {
                pointFns.push(createSplineFn(points[x], points[x+1], points[x-1], points[x+2]));
            }

            var numFns = pointFns.length;

            // To deal with 1.0, add an extra function that always returns the last point
            var lastPoint = points[points.length-2];
            pointFns.push(() => { return lastPoint });

            // Returns a point on the path
            function pointAt(pos: number): Point2D {
                // Work out which function we should use
                var actualPos   = pos*numFns;
                var index       = Math.floor(actualPos);

                // actualPos goes from 0-1 (ie, is the fractional part of pos*numFns)
                actualPos -= index;

                // Call the appropriate function to generate the value at this position
                return pointFns[index](actualPos);
            }

            this.pointAt = pointAt;
        }

        /**
         * Returns a point on this path
         *
         * The proportion can be between 0 and one.
         *
         * Points should be in order but do not have to be linearly spaced
         */
        pointAt: (proportion: number) => Point2D;
    }
}
