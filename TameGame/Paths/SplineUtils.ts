module TameGame {
    /**
     * Creates a hermite interpolation function
     */
    export function createHermiteInterpolationFn(start: number, end: number, startTangent: number, endTangent: number): (proportion: number) => number {
        return (pos1: number) => {
            // Calculate powers of pos1 (pos2 = pos1^2, pos3 = pos1^3)
            var pos2 = pos1 * pos1;
            var pos3 = pos2 * pos1;

            // Calculate the basis functions
            var h1 = 2*pos3 - 3*pos2 + 1;
            var h2 = -2*pos3 + 3*pos2;
            var h3 = pos3 - 2*pos2 + pos1;
            var h4 = pos3 - pos2;

            // Finally, the result
            return h1*start + h2*end + h3*startTangent + h4*endTangent;
        };
    }

    /**
     * Creates a cardinal spline function
     *
     * A tightness constant of 0.5 (or an omitted tightness constant) will produce a Catmull-Rom spline
     */
    export function createCardinalSplineFn(start: number, end: number, previous: number, next: number, tightnessConstant?: number): (proportion: number) => number {
        // Default value of the tightness constant is 0.5
        if (typeof tightnessConstant === 'undefined') {
            tightnessConstant = 0.5;
        }

        var startTangent    = tightnessConstant * (end-previous);
        var endTangent      = tightnessConstant * (next-start);

        return createHermiteInterpolationFn(start, end, startTangent, endTangent);
    }

    /**
     * Creates a function that generates a spline interpolating between four points
     *
     * The spline will pass through the start and end points and the curve will be shaped by the previous and next points
     */
    export function createSplineFn(start: Point2D, end: Point2D, previous: Point2D, next: Point2D, tightnessConstant?: number): (proportion: number) => Point2D {
        var xSpline = createCardinalSplineFn(start.x, end.x, previous.x, next.x, tightnessConstant);
        var ySpline = createCardinalSplineFn(start.y, end.y, previous.y, next.y, tightnessConstant);

        return (proportion: number) => {
            return { 
                x: xSpline(proportion),
                y: ySpline(proportion)
            };
        }
    }
}
