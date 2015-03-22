/// <reference path="../Core/Interface.ts" />

module TameGame {
    "use strict";

    /** 
     * Set of behaviors that are used to define how physics works in a scene
     */
    export interface IPhysicsBehavior {
        /** Applies forces to objects in a scene */
        applyForces?: (scene: Scene, tick: Tick, time: number, lastTime: number) => void;

        /** Causes objects in a scene to move between two ticks */
        moveObjects?: (scene: Scene, tick: Tick, time: number, lastTime: number) => void;

        /** Detects any collisions that might have occurred in this scene */
        detectCollisions?: (scene: Scene, tick: Tick, time: number, lastTime: number) => void;
    }

    export interface Behavior {
        /** Provides actions when two objects collide */
        physics?: IPhysicsBehavior;
    }

    /**
     * Behavior representing 'no physics'
     */
    export var NoPhysicsBehavior: IPhysicsBehavior = {
        applyForces: () => { },
        moveObjects: () => { },
        detectCollisions: () => { }
    };

    /** 
     * Set of behaviors that are used to define how physics works in a scene
     */
    export var PhysicsBehavior = declareBehavior<IPhysicsBehavior>('physics', () => {
        // No object collision behavior by default
        return NoPhysicsBehavior;
    });

    export function generatePhysicsBehavior(game: Game) {
        // Objects become 'alive' if they acquire motion
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

        // Apply the physics behavior on each game tick applied to a scene
        game.events.onCreateScene((newScene) => {
            newScene.events.onTick(UpdatePass.PhysicsMotion, (tick, time, lastTime) => {
                var physics = newScene.behavior.physics;

                if (physics.applyForces) {
                    physics.applyForces(newScene, tick, time, lastTime);
                }
                if (physics.moveObjects) {
                    physics.moveObjects(newScene, tick, time, lastTime);
                }
            });
        });

        game.events.onCreateScene((newScene) => {
            newScene.events.onTick(UpdatePass.PhysicsCollision, (tick, time, lastTime) => {
                var physics = newScene.behavior.physics;

                if (physics.detectCollisions) {
                    physics.detectCollisions(newScene, tick, time, lastTime);
                }
            });
        });
    }
}
