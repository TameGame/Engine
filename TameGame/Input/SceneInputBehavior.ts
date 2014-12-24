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

            // Modify the event registration functions so that they convert any locations to the scene's camera
            var originalOnActionDown    = newScene.controlEvents.onActionDown;
            var originalOnActionUp      = newScene.controlEvents.onActionUp;
            var originalOnDuringAction  = newScene.controlEvents.onDuringAction;

            var createModifiedCallback  = (originalCallback: Event<ControlInput>): Event<ControlInput> => {
                var newCallback = (originalControl: ControlInput, milliseconds: number) => {
                    var modifiedControl = originalControl;

                    // TODO: If the control uses a location, and the scene has a camera position, then translate the location from 0,0-1,0 to the scene's own coordinates
                    if (originalControl.location && newScene.camera) {
                        // TODO: this doesn't actually modify it, just copies the object into a new one
                        modifiedControl = {
                            device:     originalControl.device,
                            control:    originalControl.control,
                            pressure:   originalControl.pressure,
                            when:       originalControl.when,
                            location:   originalControl.location
                        };
                    }

                    // Call the original event handler
                    return originalCallback(modifiedControl, milliseconds);
                };

                return newCallback;
            };

            newScene.controlEvents.onActionDown     = (type, callback) => originalOnActionDown(type, createModifiedCallback(callback));
            newScene.controlEvents.onActionUp       = (type, callback) => originalOnActionUp(type, createModifiedCallback(callback));
            newScene.controlEvents.onDuringAction   = (type, callback) => originalOnDuringAction(type, createModifiedCallback(callback));
        });
    }
}
