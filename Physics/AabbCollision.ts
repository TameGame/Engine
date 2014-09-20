/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="SetObjectTransform.ts" />
/// <reference path="QuadTree.ts" />
/// <reference path="SceneQuadTree.ts" />
/// <reference path="ShapeCollision.ts" />

module TameGame {
    // Objects can only collide once per collision pass
    var collisionPass: number = 0;
    
    // Extend the TameObject definition so that it stores the last time this object was in a collision
    export interface TameObject {
        lastCollisionPass?: number;
    }
    
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
        (collidedWith: TameObject, thisObject: TameObject) : void;
    }
    
    export interface Behavior {
        aabbCollision?: IAabbCollisionBehavior;
    }
    
    export var AabbCollisionBehavior: TypeDefinition<IAabbCollisionBehavior> = declareBehavior('aabbCollision', () => {
        return (collidedWith: TameObject, thisObject: TameObject) => {
            // Do no further checking if the object we've collided with has already been processed
            // Any collisions that it will have had with this object will already have been taken care of
            if (collidedWith.lastCollisionPass === collisionPass) {
                return;
            }

            // By default, we check if the shapes are collided
            var collision = areCollided(thisObject, collidedWith);

            // If they are, then call appropriate method to indicate that the shapes are colliding
            if (collision) {
                // Retrieve the reverse collision (in case we need to call both objects)
                // TODO: maybe we can just ask the original collision to reverse its perspective for better performance
                // This isn't elegant but it will work.
                var thatCollision = areCollided(collidedWith, thisObject);

                // Get the behaviour for both objects
                var thisCollide = thisObject.behavior.shapeCollision;
                var thatCollide = collidedWith.behavior.shapeCollision;

                // Get the priority for the two objects
                var thisPriority = thisCollide.priority?thisCollide.priority(collidedWith): (thisObject.collisionPriority || 0);
                var thatPriority = thatCollide.priority?thatCollide.priority(thisObject): (collidedWith.collisionPriority || 0);

                // Call the behaviours in the appropriate orders
                if (thisPriority >= thatPriority) {
                    if (!thisCollide.shapeCollision(collision, collidedWith, thisObject)) {
                        thatCollide.shapeCollision(thatCollision, thisObject, collidedWith);
                    }
                } else {
                    if (!thatCollide.shapeCollision(thatCollision, thisObject, collidedWith)) {
                        thisCollide.shapeCollision(collision, collidedWith, thisObject);
                    }
                }
            }
        };
    });
    
    /**
     * When an object moves, test for collision with other nearby objects
     */
    export function generateAabbCollisionBehavior(game: Game) {
        // Every update pass, update the collision pass number
        game.events.onPassStart(UpdatePass.Preparation, () => {
            ++collisionPass;
        });
        
        // When the presence for an object is updated, check for collisions and react if necessary
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
                obj.behavior.aabbCollision(collideObj, obj);
            });
            
            // Update the collision pass number of this object
            obj.lastCollisionPass = collisionPass;
        });
    }
}
