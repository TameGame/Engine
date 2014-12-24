/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="DefaultControlEvents.ts" />

module TameGame {
    // Extra functions for supporting input in the scene
    export interface Scene {
        /**
         * Registers event handlers for control actions that apply to this scene
         */
        controlEvents?: ControlEvents;
    }

    /**
     * Enables input routing to Scenes in the specified game
     */
    export function sceneInputBehavior(game: Game) {
        // When a scene is created in a game, enable registering control events
        game.events.onCreateScene((newScene) => {
            // Create the event registration functions (using the game's control router)
            newScene.controlEvents = new DefaultControlEvents(game.controlRouter.actionForInput);
        });

        // TODO: when scene events have a location associated with them, modify it so that it's in scene camera coordinates
    }
}
