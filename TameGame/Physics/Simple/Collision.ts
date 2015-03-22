/// <reference path="SimplePhysics.ts" />

module TameGame {
    "use strict";

    /**
     * Performs a basic AABB collision pass
     */
    function simplePhysicsCollision(scene: Scene, tick: Tick, time: number, lastTime: number) {
        // Update any object that has moved
        scene.updateMovedObjects();

        if (scene.space) {
            // Find all the collisions in this scene's space
            var left: SpaceRef<TameObject>[] = [];
            var right: SpaceRef<TameObject>[] = [];

            scene.space.findCollisionPairs(left, right);

            // Resolve any collisions that might have occurred
            if (left.length > 0) {
                scene.behavior.aabbCollision.resolveCollisions(left, right, scene);
            }
        }
    }

    SimplePhysicsBehavior.detectCollisions = simplePhysicsCollision;
}
