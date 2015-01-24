/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="SatCollision.ts" />
/// <reference path="ObjectCollision.ts" />

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
        /** Resolves collisions between shapes in a scene */
        shapeCollision?: ISceneShapeCollisionBehavior;
    }
    
    export var SceneShapeCollisionBehavior = declareBehavior<ISceneShapeCollisionBehavior>('shapeCollision', () => {
        return { 
            resolveShapeCollisions: (left: TameObject[], right: TameObject[]) => { 
                // The basic collision behaviour is to move the objects so that they are no longer colliding
                for (var index = 0; index<left.length; ++index) {
                    // Fetch details of this collision
                    var leftObj             = left[index];
                    var rightObj            = right[index];

                    // Default behavior is just to invoke the object collision behavior
                    var leftCollided        = leftObj.behavior.objectCollision.collided;
                    var rightCollided       = rightObj.behavior.objectCollision.collided;

                    if (leftCollided) {
                        leftCollided(leftObj, rightObj);
                    }

                    if (rightCollided) {
                        rightCollided(leftObj, rightObj);
                    }
                }
            } 
        };
    });
}
