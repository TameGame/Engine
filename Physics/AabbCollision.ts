/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="SetObjectTransform.ts" />
/// <reference path="QuadTree.ts" />
/// <reference path="SceneQuadTree.ts" />
/// <reference path="ShapeCollision.ts" />

module TameGame {
    /**
     * Object behavior that defines what happens when the axis-aligned bounding box of two objects collide
     *
     * This call is made during the PhysicsCollision update pass. It doesn't necessarily mean that the objects
     * have collided, only that their bounding boxes are overlapping. 
     */
    export interface IAabbCollisionBehavior {
        /**
         * Indicates an axis-aligned bounding box collision between collidedWith and thisObject
         *
         * thisObject is the object that moved to create the collision.
         * This will be called on both sides if both objects are in motion. It will only be
         * called once if collidedWith is stationary.
         */
        aabbCollision(collidedWith: TameObject, thisObject: TameObject);
    }
    
    export var AabbCollisionBehavior: TypeDefinition<IAabbCollisionBehavior> = {
        name: createTypeName(),
        createDefault: () => {
            return { aabbCollision: (collidedWith, thisObject) => {
                    var collision = areCollided(thisObject, collidedWith);
                
                    if (collision) {
                        thisObject.getBehavior(ShapeCollisionBehavior).shapeCollision(collision, collidedWith, thisObject);
                    }
                }
            };
        }
    };
    
    /**
     * When an object moves, test for collision with other nearby objects
     */
    export function generateAabbCollisionBehavior(game: Game) {
        game.watch(Presence, UpdatePass.PhysicsCollision, (obj, presence) => {
            // Get the object's location
            var aabb    = obj.aabb;
            var scene   = obj.scene;
            
            if (!aabb || !scene) {
                return;
            }
            
            // Find all of the objects that this one could have collided with
            scene.quadTree.forAllInBounds(aabb, (collideObj) => {
                // This will return the original object as well as the objects it has collided with
                // Only return collisions for other objects
                if (collideObj === obj) {
                    return;
                }
                
                // Run the collision behavior
                obj.getBehavior(AabbCollisionBehavior).aabbCollision(collideObj, obj);
            });
        });
    }
}
