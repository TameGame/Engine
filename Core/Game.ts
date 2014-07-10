/// <reference path="Interface.ts"/>
/// <reference path="Watch.ts" />

module TameGame {
    /**
     * The internal scene interface describes events and properties used
     * to help with dispatching the property changed events
     */
    interface InternalScene extends Scene {
        _watchers: RegisteredWatchers;
        objectInScene(id:number): boolean;
        getChildScenes(): InternalScene[];
    }

    /**
     * The default Game class
     *
     * Note that in general that you should not directly create this object
     * but rather use the launcher to start a new game.
     */
    export class StandardGame implements Game {
        private _currentScene: Scene;
        private _nextIdentifier: number;
        private _watchers: RegisteredWatchers;
        private _recentChanges: Watcher;
        private _immediate: { [propertyName: string]: (TameObject) => void };
        private _immediateActions: { [propertyName: string]: { (TameObject): void }[] };

        constructor() {
            // Set up the variables
            this._nextIdentifier    = 0;
            this._watchers          = new RegisteredWatchers();
            this._recentChanges     = new Watcher();
            this._immediate         = {};
            this._immediateActions  = {};
            
            // Initialise the default behaviours
            Object.keys(defaultBehavior).sort().forEach((behaviorName) => defaultBehavior[behaviorName](this));
        }

        /**
         * Attaches watchers to the specified object
         *
         * This means that any get/set operation will end up in the 
         * _recentChanges object for this game
         */
        watchify<T>(propertyObj: T, sourceObj: TameObject, propertyType: TypeDefinition<T>): SettableProperty<T> {
            var result  = {};
            var backing = {};

            var immediate           = this._immediate;
            var propertyTypeName    = propertyType.name;

            // Ensure that there is an immediate action for this property type name
            if (!immediate[propertyTypeName]) {
                immediate[propertyTypeName] = () => {};
            }

            // Set up a backing store
            Object.getOwnPropertyNames(propertyObj).forEach((prop) => {
                backing[prop] = propertyObj[prop];
            });
            
            // Setting the property should trigger any attached watchers
            Object.getOwnPropertyNames(propertyObj).forEach((prop) => {
                // Add get/set accessors to the result for this property
                (() => {
                    var p = prop;

                    Object.defineProperty(result, prop, {
                        get: () => backing[p],
                        set: (newValue) => {
                            backing[p] = newValue;
                            this._recentChanges.noteChange(sourceObj, propertyType);
                            immediate[propertyTypeName](sourceObj);
                        }
                    });
                })();
            });
            
            // Calling setValue updates the backing store and fires a single event
            result['set'] = (newValue) => {
                // Update everything in the backing store
                Object.getOwnPropertyNames(backing).forEach((prop) => {
                    backing[prop] = newValue[prop];
                });
                
                // Fire the event once
                this._recentChanges.noteChange(sourceObj, propertyType);
                immediate[propertyTypeName](sourceObj);
            };

            return <SettableProperty<T>> result;
        }

        /**
         * Creates a new TameObject that will participate in this game
         */
        createObject(): TameObject {
            // An object contains some properties and behaviors, which we declare here
            var properties = {};
            var behaviors = {};
            var obj: TameObject;

            var identifier = this._nextIdentifier;
            this._nextIdentifier++;

            // Declare the functions for retrieving and altering the properties and behaviors
            var that = this;
            function getProp<TPropertyType>(definition: TypeDefinition<TPropertyType>): TPropertyType {
                var name = definition.name;
                var val = properties[name];

                if (val) {
                    // Use the existing value if there is one
                    return val;
                } else {
                    // Create a new value if there isn't
                    properties[name] = that.watchify(definition.createDefault(), obj, definition);
                    return properties[name];
                }
            }

            function getBehavior<TBehaviorType>(definition: TypeDefinition<TBehaviorType>): TBehaviorType {
                var name = definition.name;

                if (name in behaviors) {
                    return behaviors[name];
                } else {
                    behaviors[name] = definition.createDefault();
                    return behaviors[name];
                }
            }

            function attachBehavior<TBehaviorType>(definition: TypeDefinition<TBehaviorType>, newBehavior: TBehaviorType) : TameObject {
                behaviors[definition.name] = newBehavior;

                return this;
            }

            obj = {
                identifier:     identifier,
                get:            getProp,
                getBehavior:    getBehavior,
                attachBehavior: attachBehavior
            };
            return obj;
        }

        /**
         * Creates a new scene
         */
        createScene(): Scene {
            // Variables used in a scene
            var objects: { [id: number]: TameObject } = {};
            var subScenes: { [id: number]: Scene } = {};
            var sceneWatchers = new RegisteredWatchers();

            // Basic functions
            function addObject(o: TameObject): Scene {
                objects[o.identifier] = o;
                return this;
            }
            function removeObject(o: TameObject): Scene {
                delete objects[o.identifier];
                return this;
            }
            function addScene(s: Scene): Scene {
                subScenes[s.identifier] = s;
                return this;
            }
            function removeScene(s: Scene): Scene {
                delete subScenes[s.identifier];
                return this;
            }

            // Assign an identifier to this object
            var identifier = this._nextIdentifier;
            this._nextIdentifier++;

            var result: InternalScene = {
                _watchers:      sceneWatchers,
                objectInScene:  (id) => objects[id]?true:false,
                getChildScenes: () => Object.keys(subScenes).map((key) => <InternalScene> subScenes[key]),
                
                identifier:     identifier,
                addObject:      addObject,
                removeObject:   removeObject,
                addScene:       addScene,
                removeScene:    removeScene,
                
                watch:          (definition, pass, callback)    => sceneWatchers.watch(definition, pass, callback),
                onPass:         (pass, callback)                => sceneWatchers.onPass(pass, callback),
                everyPass:      (pass, callback)                => sceneWatchers.everyPass(pass, callback)
            };
            
            return result;
        }

        /**
         * Starts running the specified scene
         */
        startScene(scene: Scene): void {
            this._currentScene = scene;
        }
        
        /**
         * Retrieves the list of currently active scenes
         */
        private getActiveScenes(): InternalScene[] {
            // There are no active scenes if the current scene is not set
            if (!this._currentScene) {
                return [];
            }
            
            // Get the active scenes recursively
            var scenes: InternalScene[] = [];
            var stack: InternalScene[] = [];
            
            stack.push(<InternalScene> this._currentScene);
            
            while (stack.length > 0) {
                var nextScene = stack.pop();
                scenes.push(nextScene);
                
                scenes.push.apply(scenes, nextScene.getChildScenes());
            }
            
            // Return the results
            return scenes;
        }

        /**
         * Runs a game tick. Time is a time in milliseconds from an arbitrary
         * fixed point (it should always increase)
         *
         * Normally you don't need to call this manually, the game launcher
         * will set things up so that it's called automatically.
         *
         * It's a good idea to choose a fixed point that's reasonably recent
         * so that time can be measured to a high degree of accuracy.
         */
        tick(milliseconds: number): void {
            // Retrieve the list of active scenes
            var activeScenes = this.getActiveScenes();
            
            // Get the watchers and filter the change list for each of the scenes
            var sceneChanges = activeScenes.map((scene) => { 
                return { watchers: scene._watchers, changes: this._recentChanges.filter(scene.objectInScene) }
            });
            
            // Run the changes through the passes
            [
                UpdatePass.Animations, 
                UpdatePass.Mechanics,
                UpdatePass.Physics, 
                UpdatePass.PreRender,
                UpdatePass.Render,
                UpdatePass.PostRender
            ].forEach((pass) => {
                // Dispatch the changes for this pass to the watchers - both global and for each scene in turn
                this._recentChanges.dispatchChanges(pass, this._watchers);
                
                sceneChanges.forEach((change) => {
                    change.changes.dispatchChanges(pass, change.watchers);
                });
            });

            // Clear out any changes that might have occured
            this._recentChanges.clearChanges();
        }

        /**
         * When any any object with an attached property of the specified
         * type detects that the contents of that property has changed,
         * call the specified callback.
         *
         * Returns a value that can be used to cancel the watch.
         *
         * Watch notifications are generally not called immediately but when
         * a particular update pass is hit during a game tick.
         */
        watch<TPropertyType>(definition: TypeDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>): Cancellable {
            if (updatePass === UpdatePass.Immediate) {
                // Get the immediate actions for this property
                var actions = this._immediateActions[definition.name];

                if (!actions) {
                    // Register new actions
                    this._immediateActions[definition.name] = actions = [];

                    // When the action occurs, call each item in the actions array
                    this._immediate[definition.name] = (obj) => {
                        actions.forEach((action) => {
                            action(obj);
                        });
                    };
                }

                // Append the action
                actions.push((obj) => {
                    callback(obj, obj.get(definition));
                });

                // TODO: cancelling
                return { cancel: () => {} };
            } else {
                // Use the standard watcher
                return this._watchers.watch(definition, updatePass, callback);
            }
        }

        /**
         * When this object is part of the active scene and the game hits
         * the specified pass as part of processing a tick, the callback
         * is called, once only.
         */
        onPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) {
        }

        /**
         * As for onPass, but the call is made every time this object is part
         * of the active scene and the game hits the specified pass.
         */
        everyPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) : Cancellable {
            return null;
        }
    }
}
