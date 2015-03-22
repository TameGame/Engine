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

    /** Detects any collisions that might have occurred in this scene */
    function detectCollisions(scene: Scene, tick: Tick, time: number, lastTime: number) {

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