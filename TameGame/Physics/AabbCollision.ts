/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="SetObjectTransform.ts" />
/// <reference path="Space.ts" />
/// <reference path="SceneSpace.ts" />
/// <reference path="ShapeCollision.ts" />

module TameGame {
    "use strict";
    
    /**
     * Scene behavior that defines what happens when some objects have overlapping axis-aligned bounding boxes
     */
    export interface ISceneAabbCollisionBehavior {
        /**
         * Called with a list of all of the objects in a scene that are involved in a collision
         */
        resolveCollisions(left: SpaceRef<TameObject>[], right: SpaceRef<TameObject>[], scene: Scene);
    }
    
    export interface Behavior {
        aabbCollision?: ISceneAabbCollisionBehavior;
    }
    
    export var SceneAabbCollisionBehavior: TypeDefinition<ISceneAabbCollisionBehavior> = declareBehavior('aabbCollision', () => {
        return {
            resolveCollisions: (left: SpaceRef<TameObject>[], right: SpaceRef<TameObject>[], scene: Scene) => {
                // Search for which pairs are still collided using the object's own collision detection
                var filteredLeft: TameObject[] = [];
                var filteredRight: TameObject[] = [];
                var collisions: Collision[] = [];

                for (var index = 0; index < left.length; ++index) {
                    var leftObj     = left[index].obj;
                    var rightObj    = right[index].obj;
                    var collision   = areCollided(leftObj, rightObj);

                    if (collision && collision.collided) {
                        filteredLeft.push(leftObj);
                        filteredRight.push(rightObj);
                        collisions.push(collision);
                    }
                }

                // Pass the objects on to the shape collider
                scene.behavior.shapeCollision.resolveShapeCollisions(filteredLeft, filteredRight, collisions);
            }
        };
    });
}
