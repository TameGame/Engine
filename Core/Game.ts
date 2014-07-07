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
            return null;
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
