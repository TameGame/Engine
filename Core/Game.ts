/// <reference path="Interface.ts"/>
/// <reference path="Watch.ts" />

module TameGame {
    //
    // The default Game class
    //
    // Note that in general that you should not directly create this object
    // but rather use the launcher to start a new game.
    //
    export class StandardGame implements Game {
        private _currentScene: Scene;
        private _nextIdentifier: number;
        private _watchers: RegisteredWatchers;
        private _recentChanges: Watcher;

        constructor() {
            this._nextIdentifier    = 0;
            this._watchers          = new RegisteredWatchers();
            this._recentChanges     = new Watcher();
        }

        //
        // Attaches watchers to the specified object
        //
        // This means that any get/set operation will end up in the 
        // _recentChanges object for this game
        //
        watchify<T>(propertyObj: T, sourceObj: TameObject, propertyType: TypeDefinition<T>): T {
            var result = {};

            for (var prop in propertyObj) {
                if (propertyObj.hasOwnProperty(prop)) {
                    // Add get/set accessors to the result for this property
                    (() => {
                        var val = propertyObj[prop];
                        Object.defineProperty(result, prop, {
                            get: () => val,
                            set: (newValue) => {
                                val = newValue;
                                this._recentChanges.noteChange(sourceObj, propertyType);
                            }
                        });
                    })();
                }
            }

            return <T> result;
        }

        //
        // Creates a new TameObject that will participate in this game
        //
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

                if (name in properties) {
                    // Use the existing value if there is one
                    return properties[name];
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

        //
        // Creates a new scene
        //
        createScene(): Scene {
            // Variables used in a scene
            var objects: { [id: number]: TameObject } = {};
            var subScenes: { [id: number]: Scene } = {};

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

            return {
                identifier:     identifier,
                addObject:      addObject,
                removeObject:   removeObject,
                addScene:       addScene,
                removeScene:    removeScene
            };
        }

        //
        // Starts running the specified scene
        //
        startScene(scene: Scene): void {
            this._currentScene = scene;
        }

        //
        // Runs a game tick. Time is a time in milliseconds from an arbitrary
        // fixed point (it should always increase)
        //
        // Normally you don't need to call this manually, the game launcher
        // will set things up so that it's called automatically.
        //
        // It's a good idea to choose a fixed point that's reasonably recent
        // so that time can be measured to a high degree of accuracy.
        //
        tick(milliseconds: number): void {
            // Run the changes through the passes
            [
                UpdatePass.Animations, 
                UpdatePass.Mechanics,
                UpdatePass.Physics, 
                UpdatePass.PreRender,
                UpdatePass.Render,
                UpdatePass.PostRender
            ].forEach((pass) => {
                // Dispatch the changes for this pass to the watchers
                this._recentChanges.dispatchChanges(pass, this._watchers);
            });

            // Clear out any changes that might have occured
            this._recentChanges.clearChanges();
        }

        //
        // When any any object with an attached property of the specified
        // type detects that the contents of that property has changed,
        // call the specified callback.
        //
        // Returns a value that can be used to cancel the watch.
        //
        // Watch notifications are generally not called immediately but when
        // a particular update pass is hit during a game tick.
        //
        watch<TPropertyType>(definition: TypeDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>): Cancellable {
            return this._watchers.watch(definition, updatePass, callback);
        }

        //
        // When this object is part of the active scene and the game hits
        // the specified pass as part of processing a tick, the callback
        // is called, once only.
        //
        onPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) {
        }

        //
        // As for onPass, but the call is made every time this object is part
        // of the active scene and the game hits the specified pass.
        //
        everyPass(updatePass: UpdatePass, callback: (milliseconds: number) => void) : Cancellable {
            return null;
        }
    }
}
