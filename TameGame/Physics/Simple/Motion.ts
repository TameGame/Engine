/// <reference path="SimplePhysics.ts" />

module TameGame {
    "use strict";

    function simplePhysicsMoveObjects(scene: Scene, tick: Tick, time: number, lastTime: number) {
        var durationSeconds = tick.duration / 1000.0;
        var liveObjects     = tick.liveObjects;
        
        // Apply motion to each of the live objects
        liveObjects.forEach((obj) => {
            var motion              = obj.motion;
            var location            = obj.location;

            var velocity            = motion.velocity;
            var rotationVelocity    = motion.rotationVelocity;
            
            if (velocity.x !== 0 || velocity.y !== 0) {
                location.pos = addVector(location.pos, scaleVector(velocity, durationSeconds));
            }

            if (rotationVelocity !== 0) {
                location.angle = location.angle + rotationVelocity*durationSeconds;
            }
        });
    };

    SimplePhysicsBehavior.moveObjects = simplePhysicsMoveObjects;
}
