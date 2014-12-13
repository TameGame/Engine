/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="DefaultControlRouter.ts" />
/// <reference path="DefaultControlEvents.ts" />

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
     export function defaultInputBehavior(game: Game) {
        game.controlRouter = new DefaultControlRouter();
        game.controlEvents = new DefaultControlEvents(game.controlRouter.actionForInput);
     }
}
