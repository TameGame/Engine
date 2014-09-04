/// <reference path="Shape.ts" />
/// <reference path="Collision.ts" />

module TameGame {
    function doesOverlap(a: Projection, b: Projection) {
        if (a.min >= b.max) return false;
        if (b.min >= a.max) return false;
        
        return true;
    }
    
    /**
     * Performs collision detection on two SAT shapes
     *
     * Returns null or an object describing the collision that occurred
     */
    export function satCollision(a: SatShape, b: SatShape): Collision {
        // Fetch the shape axes
        var aAxes = a.getAxes();
        var bAxes = b.getAxes();
        
        var result: Collision = null;
        
        /** Checks against all of the axes on a particular shape */
        function checkAxes(axes: Point2D[]) {
            return axes.some((axis) => {
                var projectA = a.projectOntoAxis(axis);
                var projectB = b.projectOntoAxis(axis);
                
                // If we find we don't overlap on any axis, then these polygons do not collide
                if (!doesOverlap(projectA, projectB)) {
                    result = { collided: false, getMtv: () => { return { x: 0, y: 0 } } };
                    return true;
                }
            });
        }
        
        /** Retrieves the overlap between two projections (which we assume to overlap already) */
        function overlap(a: Projection, b: Projection): Projection {
            return { min: Math.max(a.min, b.min), max: Math.min(a.max, b.max) };
        }
        
        /** Retrieves the minimum translation distance for two objects that have collided */
        function getMtvFromAxesCollided(...axesList: Point2D[][]): Point2D {
            var smallestOverlap: number = Number.MAX_VALUE;
            var overlapAxis: Point2D    = null;
            
            axesList.forEach((axes) => {
                axes.forEach((axis) => {
                    // Normalise the axis
                    axis = unit(axis);

                    // Project onto the normalised axis
                    var projectA = a.projectOntoAxis(axis);
                    var projectB = b.projectOntoAxis(axis);

                    if (doesOverlap(projectA, projectB)) {
                        var thisOverlap = overlap(projectA, projectB);
                        var overlapAmount = thisOverlap.max - thisOverlap.min;
                        
                        if (overlapAmount < smallestOverlap) {
                            smallestOverlap = overlapAmount;
                            overlapAxis     = axis;
                        }
                    }
                });
            });
            
            if (overlapAxis) {
                // Based on the overlap axis
                return { x: -overlapAxis.x * smallestOverlap, y: -overlapAxis.y * smallestOverlap };
            } else {
                // No known axis
                return { x: 0, y: 0 };
            }
        }
        
        // Check for collisions
        if (checkAxes(aAxes) || checkAxes(bAxes)) {
            return result;
        } else {
            return { collided: true, getMtv: () => getMtvFromAxesCollided(a.getAxes(), b.getAxes()) };
        }
    }
}
