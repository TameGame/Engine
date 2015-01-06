/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />

module TameGame {
    /**
     * The simple ambient motion behavior
     *
     * Any object that gets a non-zero velocity becomes 'alive'
     * Live objects have their presence updated during every tick
     */
    export function simpleMotionBehavior(game: Game) {
        game.watch(Motion, UpdatePass.Preparation, (obj, objMotion) => {
            // We only execute this behaviour once per object
            if (obj['_hasMotion']) {
                return;
            }
            
            // Object becomes alive if its motion is changed to a non-zero value
            if (objMotion.rotationVelocity !== 0 ||
                objMotion.velocity.x !== 0 ||
                objMotion.velocity.y !== 0) {
                // Mark the object as alive
                obj.aliveStatus.isAlive = true;
                
                obj['_hasMotion'] = true;
            }
        });
        
        // During the physics tick, move the objects by 
        game.events.onTick(UpdatePass.PhysicsMotion, (tick) => {
            var durationSeconds = tick.duration / 1000.0;
            var liveObjects     = tick.liveObjects;
            
            // Apply motion to each of the live objects
            liveObjects.forEach((obj) => {
                var motion              = obj.motion;
                var presence            = obj.presence;

                var velocity            = motion.velocity;
                var rotationVelocity    = motion.rotationVelocity;
                
                if (velocity.x !== 0 || velocity.y !== 0) {
                    presence.location = addVector(presence.location, scaleVector(velocity, durationSeconds));
                }

                if (rotationVelocity !== 0) {
                    presence.rotation = presence.rotation + rotationVelocity*durationSeconds;
                }
            });
        });
    }
}
