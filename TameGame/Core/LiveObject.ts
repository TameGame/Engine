/// <reference path="Interface.ts" />
/// <reference path="Event.ts" />

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
        onTick?: FilteredEventRegistration<UpdatePass, Tick>;
    }
    
    /**
     * Extends the game events interface so that it can support live ticks
     */
    export interface GameEvents {
        onTick?: FilteredEventRegistration<UpdatePass, Tick>;
    }
    
    /**
     * Data passed to a live object tick event
     */
    export interface Tick {
        /** Time since last tick */
        duration: number;
        
        /** The objects that the tick applies to */
        liveObjects: TameObject[];
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
    
    export interface TameObject {
        aliveStatus?: IAliveStatus;
    }
    
    export var AliveStatus: PropertyDefinition<IAliveStatus> = declareProperty("aliveStatus", () => {
        return { isAlive: false };
    });
    
    // Tick at 60fps
    var tickDuration = 1000.0 / 120.0;
    var maxPassTime  = 1000.0 / 15.0;

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
        var gameTicks = createFilteredEvent<UpdatePass, Tick>();
        game.events.onTick = gameTicks.register;
        
        // When a new scene begins, the live ticks are reset
        game.events.onNewScene((newScene) => resetTicks(newScene));
        
        // When a scene is created, it will acquire live objects behaviour
        game.events.onCreateScene((standardScene) => {
            var scene = <InternalLiveObjectsScene> standardScene;

            // Register the ticks event
            var sceneTicks = createFilteredEvent<UpdatePass, Tick>();
            scene.events.onTick = sceneTicks.register;

            // The scene will initially have no live objects
            scene.liveObjects = {};
            
            // The last time, or negative if no ticks have passed
            var lastTime = -1;
            var lastTick = 0;
            scene.internalResetTick = () => { lastTime = -1; tickObjects = []; };
            
            // Removing an object from a scene removes it from the live objects list
            scene.events.onRemoveObject((obj) => {
                delete scene.liveObjects[obj.identifier];
            });
            
            // Adding an object to the scene adds it to the live objects list if it's not there already
            scene.events.onAddObject((obj) => {
                if (obj.aliveStatus.isAlive) {
                    scene.liveObjects[obj.identifier] = obj;
                }
            });
            
            // This is the set of objects updated in the most recent tick
            var tickObjects: TameObject[] = [];
            
            // Live objects run on the early passes of the engine
            preRenderPasses.forEach((updatePass) => {
                scene.events.onPassStart(updatePass, (pass: UpdatePass, time: number) => {
                    // If no time has passed yet, we do nothing
                    if (lastTime < 0) return;
                    
                    // Create the list of tick objects in the earliest update pass (which happens to be the animations pass)
                    if (updatePass === firstUpdatePass) {
                        var liveObjectList = scene.liveObjects;
                        tickObjects = [];
                        Object.keys(liveObjectList).forEach((objId) => tickObjects.push(liveObjectList[objId]));
                    }
                    
                    var onTick = (tick: Tick, tickTime: number, lastTickTime: number) => {
                        gameTicks.fire(updatePass, tick, time, lastTickTime);
                        sceneTicks.fire(updatePass, tick, time, lastTickTime);
                    };
                    
                    // They are called at 60fps. If the game engine is running slow they get called multiple times
                    // to catch up
                    //
                    // If the ticks take too long to process then we only process them until we hit maxPassTime
                    // This deals with cases where the game is suspended or is running slow
                    var processingStartTime = perf.now();
                    var processingEndTime   = processingStartTime + maxPassTime;
                    
                    for (var tickTime = lastTime; tickTime < time; tickTime += tickDuration) {
                        // Call the tick functions
                        onTick({ duration: tickDuration, liveObjects: tickObjects }, lastTick, lastTick-tickDuration);
                        lastTick += tickDuration;
                        
                        // Don't process beyond the end time
                        if (perf.now() > processingEndTime) {
                            break;
                        }
                    }
                });
            });
            
            // Time updates post-render
            scene.events.onPassFinish(UpdatePass.PostRender, (pass, time: number) => {
                lastTime = time;
            });
            
            // When a scene is added to another one, the tick is reset (so a 'paused' scene doesn't have time pass for it)
            scene.events.onAddSubScene((newScene) => resetTicks(newScene));
        });
        
        // Setting the 'isAlive' flag on an object updates the live objects list
        game.watch(AliveStatus, UpdatePass.Immediate, (obj, newValue) => {
            if (!obj.scene) {
                return;
            }
            
            if (newValue.isAlive) {
                obj.scene.liveObjects[obj.identifier] = obj;
            } else {
                delete obj.scene.liveObjects[obj.identifier];
            }
        });
    }
}
