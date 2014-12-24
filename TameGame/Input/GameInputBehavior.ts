/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="DefaultControlRouter.ts" />
/// <reference path="DefaultControlEvents.ts" />
/// <reference path="SceneInputBehavior.ts" />

module TameGame {
    // Extensions to the game interface to support input
    export interface Game {
        /** The main control router for the game */
        controlRouter?: ControlRouter;

        /** Registers event handlers for controls that apply across the entire game */
        controlEvents?: ControlEvents;
    }

    /**
     * The default input behavior
     *
     * Input is dispatched through the default control router to the default control events object
     */
     export function defaultInputBehavior(game: Game, dispatcher: WorkerMessageDispatcher) {
        // Controls that have active pressure on them
        var activeControls: ControlMap<ControlInput> = {};

        // Give the game the default control router and events objects
        game.controlRouter = new DefaultControlRouter();
        game.controlEvents = new DefaultControlEvents(game.controlRouter.actionForInput);

        // Register the scene input behavior as well
        sceneInputBehavior(game);

        // When th  worker sends control events, update the list of controls
        dispatcher.onMessage(workerMessages.inputControl, (msg) => {
            var input: ControlInput = msg.data.input;

            if (input.pressure > 0) {
                setControlMap(activeControls, input, input);
            } else {
                deleteControlMap(activeControls, input);
            }
        });

        // Every game tick, dispatch the player input
        game.events.onPassStart(UpdatePass.PlayerInput, (pass, time) => {
            // Collect all the control inputs into a single array
            var allInput: ControlInput[] = [];
            forEachControlMap(activeControls, (control, input) => allInput.push(input));

            // Dispatch the input to the game events object
            game.controlEvents.tickInputs(allInput, time);

            // Also dispatch the input to all the active scenes
            game.forAllActiveScenes((scene) => {
                if (scene.controlEvents && scene.controlEvents.tickInputs) {
                    scene.controlEvents.tickInputs(allInput, time);
                }
            });
        });
     }
}
