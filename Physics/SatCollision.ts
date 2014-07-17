/// <reference path="Shape.ts" />
/// <reference path="Collision.ts" />

module TameGame {
    function doesOverlap(a: Projection, b: Projection) {
        if (a.min > b.max) return false;
        if (b.min > a.max) return false;
        
        return true;
    }
    
    /**
     * Performs collision detection on two SAT shapes
     */
    export function satCollision(a: SatShape, b: SatShape): Collision {
        // Fetch the shape axes
        var aAxes = a.getAxes();
        var bAxes = b.getAxes();
        
        var result: Collision = null;
        
        function checkAxes(axes: Point2D[]) {
            return axes.some((axis) => {
                var projectA = a.projectOntoAxis(axis);
                var projectB = b.projectOntoAxis(axis);
                
                // If we find we don't overlap on any axis, then these polygons do not collide
                if (!doesOverlap(projectA, projectB)) {
                    result = { collided: false };
                    return true;
                }
            });
        }
        
        // Check for collisions
        if (checkAxes(aAxes) || checkAxes(bAxes)) {
            return result;
        } else {
            return { collided: true };
        }
    }
}
