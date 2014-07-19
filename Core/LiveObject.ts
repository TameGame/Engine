/// <reference path="Interface.ts" />
/// 

module TameGame {
    /**
     * Extends the scene interface so that every scene has a set of live objects
     */
    export interface Scene {
        liveObjects?: { [id: number]: TameObject };
    }
    
    /**
     * Extends the scene interface so that it can support live ticks
     */
    export interface SceneEvents {
        onTick?: EventRegistration<Tick>;
    }
    
    /**
     * Extends the game events interface so that it can support live ticks
     */
    export interface GameEvents {
        onTick?: EventRegistration<Tick>;
    }
    
    /**
     * Data passed to a live object tick event
     */
    export interface Tick {
        /** Time since last tick */
        duration: number;
        
        /** The object that the tick applies to */
        obj: TameObject;
    }
    
    /**
     * There are some functions used internally by liveObjects
     */
    interface InternalLiveObjectsScene extends Scene {
        internalResetTick?: () => void;
    }
    
    /**
     * Properties representing whether or not a particular object is considered to be 'live'
     */
    export interface IAliveStatus {
        isAlive: boolean;
    }
    export var AliveStatus: TypeDefinition<IAliveStatus> = {
        name: createTypeName(),
        createDefault: () => {
            return { isAlive: false };
        }
    };
    
    // Tick at 60fps
    var tickDuration = 1000.0 / 60.0;

    /** Resets the ticks for a scene (and any subscenes it may have) */
    function resetTicks(scene: Scene) {
        var internalScene = <InternalLiveObjectsScene> scene;
        internalScene.internalResetTick();

        scene.forAllSubscenes((resetScene) => {
            resetTicks(resetScene);
        });
    }


    /**
     * Attaches the live object behavior to a game
     */
    export function liveObjectBehavior(game: Game) {
        // Register the ticks event
        var gameTicks = createEvent<Tick>();
        game.events.onTick = gameTicks.register;
        
        // When a new scene begins, the live ticks are reset
        game.events.onNewScene((newScene) => resetTicks(newScene));
        
        // When a scene is created, it will acquire live objects behaviour
        game.events.onCreateScene((standardScene) => {
            var scene = <InternalLiveObjectsScene> standardScene;

            // Register the ticks event
            var sceneTicks = createEvent<Tick>();
            scene.events.onTick = sceneTicks.register;

            // The scene will initially have no live objects
            scene.liveObjects = {};
            
            // The last time, or negative if no ticks have passed
            var lastTime = -1;
            scene.internalResetTick = () => { lastTime = -1; };
            
            // Removing an object from a scene removes it from the live objects list
            scene.events.onRemoveObject((obj) => {
                delete scene.liveObjects[obj.identifier];
            });
            
            // Adding an object to the scene adds it to the live objects list if it's not there already
            scene.events.onAddObject((obj) => {
                if (obj.get(AliveStatus).isAlive) {
                    scene.liveObjects[obj.identifier] = obj;
                }
            });
            
            // Live objects run on the early passes of the engine
            [ UpdatePass.Animations, UpdatePass.Mechanics, UpdatePass.Physics, UpdatePass.PreRender ].forEach((updatePass) => {
                scene.events.onPassStart(updatePass, (time: number) => {
                    // If no time has passed yet, we do nothing
                    if (lastTime < 0) return;
                    
                    var onTick = (tick: Tick) => {
                        gameTicks.fire(tick, time);
                        sceneTicks.fire(tick, time);
                    };
                    
                    // They are called at 60fps. If the game engine is running slow they get called multiple times
                    // to catch up
                    var liveObjectList = scene.liveObjects;
                    for (var tickTime = lastTime; tickTime < time; tickTime += tickDuration) {
                        Object.keys(liveObjectList).forEach((objId) => {
                            // Get the object that is being acted upon
                            var liveObject = liveObjectList[objId];
                            
                            // Call the tick functions
                            onTick({ duration: tickDuration, obj: liveObject });
                        });
                    }
                });
            });
            
            // Time updates post-render
            scene.events.onPassFinish(UpdatePass.PostRender, (time: number) => {
                lastTime = time;
            });
            
            // When a scene is added to another one, the tick is reset (so a 'paused' scene doesn't have time pass for it)
            scene.events.onAddSubScene((newScene) => resetTicks(newScene));
        });
        
        // Setting the 'isAlive' flag on an object updates the live objects list
        game.watch(AliveStatus, UpdatePass.Immediate, (obj, newValue) => {
            if (newValue.isAlive) {
                obj.scene.liveObjects[obj.identifier] = obj;
            } else {
                delete obj.scene.liveObjects[obj.identifier];
            }
        });
    }
}
