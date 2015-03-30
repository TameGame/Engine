/// <reference path="../PhysicsBehavior.ts" />
/// <reference path="Space.ts" />

module TameGame {
    "use strict";

    /** Applies forces to objects in a scene */
    function applyForces(scene: Scene, tick: Tick, time: number, lastTime: number) {
        // This is done as part of the movement phase
    }

    /** Causes objects in a scene to move between two ticks */
    function moveObjects(scene: Scene, tick: Tick, time: number, lastTime: number) {
        var space: P2Space<TameObject> = <P2Space<TameObject>> scene.space;

        if (space.tick) {
            space.tick(lastTime - time);
        }
    }

    // All collisions end up with the same value as P2.js ensures that obejcts don't overlap (so there's no MTV)
    // We just re-use an array with the appropriate length rather than regenerate objects all the time
    var genericCollision: Collision = { collided: true, getMtv: () => { return { x: 0, y: 0 }; } }
    var collisionList: Collision[] = [];

    /** Detects any collisions that might have occurred in this scene */
    function detectCollisions(scene: Scene, tick: Tick, time: number, lastTime: number) {
        if (scene.space) {
            // Find all the collisions in this scene's space
            var left: SpaceRef<TameObject>[] = [];
            var right: SpaceRef<TameObject>[] = [];

            // Find the collisions that have occurred
            scene.space.findCollisionPairs(left, right);

            // This is kind of a hack: as all the collision objects are the same, we can just re-use the array without needing to regenerate it
            // We don't have a way to get the MTV (in fact, it's [0,0] as p2.js ensures that collided shapes don't overlap)
            while (collisionList.length < left.length) {
                collisionList.push(genericCollision);
            }

            // These are shape collisions
            if (left.length > 0) {
                scene.behavior.shapeCollision.resolveShapeCollisions(left.map(ref => ref.obj), right.map(ref => ref.obj), collisionList);
            }
        }
    }

    /** Behavior that enables P2JS physics on a scene */
    export var P2PhysicsBehavior: IPhysicsBehavior = {
        applyForces: applyForces,
        moveObjects: moveObjects,
        detectCollisions: detectCollisions
    };

    /** Create the simple physics behavior */
    declareBehaviorClass("P2Physics", { physics: P2PhysicsBehavior });
}