/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="SatCollision.ts" />

module TameGame {
    "use strict";

    export interface TameObject {
        /** 
         * Optional default priority for processing collisions 
         *
         * This is the value used for the collision priority for this object if the shape
         * collision behaviour does not implement a priority method.
         */
        collisionPriority?: number;
    }
    
    /** 
     * Returns true if two objects have collided
     */
    export function areCollided(a: TameObject, b: TameObject): Collision {
        var aPresence = a.presence;
        var bPresence = b.presence;
        
        if (!aPresence.shape || !bPresence.shape) return null;
        
        var aSat = <SatShape> aPresence.shape.transform(a.transformationMatrix);
        var bSat = <SatShape> bPresence.shape.transform(b.transformationMatrix);
        
        return satCollision(aSat, bSat);
    }
    
    /**
     * Behavior that describes what happens to the objects that are in collision in a scene
     */
    export interface ISceneShapeCollisionBehavior {
        /** 
         * This scene contains collisions that need to be resolved
         */
        resolveShapeCollisions(left: TameObject[], right: TameObject[], collision: Collision[]);
    }
    
    export interface Behavior {
        shapeCollision?: ISceneShapeCollisionBehavior;
    }
    
    export var ShapeCollisionBehavior = declareBehavior<ISceneShapeCollisionBehavior>('shapeCollision', () => {
        return { 
            resolveShapeCollisions: (left: TameObject[], right: TameObject[], collision: Collision[]) => { 
                // The basic collision behaviour is to move the objects so that they are no longer colliding
                for (var index = 0; index<left.length; ++index) {
                    // Fetch details of this collision
                    var leftObj             = left[index];
                    var rightObj            = right[index];
                    var collisionDetails    = collision[index];

                    var leftPresence        = leftObj.presence;
                    var rightPresence       = rightObj.presence;

                    // The MTV is the minimum distance the objects need to move so that they no longer overlap
                    var mtv = collisionDetails.getMtv();

                    // Both objects move by half the mtv
                    mtv.x /= 2.0;
                    mtv.y /= 2.0;

                    // Move the objects so that they're no longer collided
                    var oldPos = leftPresence.location;
                    var newPos = { x: oldPos.x + mtv.x, y: oldPos.y + mtv.y };

                    leftPresence.location = newPos;

                    oldPos = rightPresence.location;
                    newPos = { x: oldPos.x - mtv.x, y: oldPos.y - mtv.y };

                    rightPresence.location = newPos;
                }
            } 
        };
    });
}
