/// <reference path="Interface.ts"/>

module TameGame {
    //
    // The default Game class
    //
    // Note that in general that you should not directly create this object
    // but rather use the launcher to start a new game.
    //
    export class StandardGame implements Game {
        private _currentScene: Scene;

        //
        // Creates a new TameObject that will participate in this game
        //
        createObject(): TameObject {
            // An object contains some properties and behaviors, which we declare here
            var properties = {};
            var behaviors = {};

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
                get:            getProp,
                getBehavior:    getBehavior,
                attachBehavior: attachBehavior
            };
        }

        //
        // Creates a new scene
        //
        createScene(): Scene {
            return null;
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
    }
}
