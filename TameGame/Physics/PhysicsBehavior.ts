module TameGame {
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
        // Apply the physics behavior on each game tick applied to a scene
        game.events.onCreateScene((newScene) => {
            newScene.events.onTick(UpdatePass.PhysicsMotion, (tick, time, lastTime) => {
                var physics = newScene.behavior.physics;

                physics.applyForces(newScene, tick, time, lastTime);
                physics.moveObjects(newScene, tick, time, lastTime);
            });
        });

        game.events.onCreateScene((newScene) => {
            newScene.events.onTick(UpdatePass.PhysicsCollision, (tick, time, lastTime) => {
                var physics = newScene.behavior.physics;

                physics.detectCollisions(newScene, tick, time, lastTime);
            });
        });
    }
}
