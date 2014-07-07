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

        new() {
            this._nextIdentifier = 0;
        }

        //
        // Creates a new TameObject that will participate in this game
        //
        createObject(): TameObject {
            // An object contains some properties and behaviors, which we declare here
            var properties = {};
            var behaviors = {};

            var identifier = this._nextIdentifier;
            this._nextIdentifier++;

            // Declare the functions for retrieving and altering the properties and behaviors
            function getProp<TPropertyType>(definition: TypeDefinition<TPropertyType>): TPropertyType {
                var name = definition.name;

                if (name in properties) {
                    // Use the existing value if there is one
                    return properties[name];
                } else {
                    // Create a new value if there isn't
                    properties[name] = definition.createDefault();
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

            return {
                identifier:     identifier,
                get:            getProp,
                getBehavior:    getBehavior,
                attachBehavior: attachBehavior
            };
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
