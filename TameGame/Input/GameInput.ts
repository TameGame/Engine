/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="DefaultControlRouter.ts" />
/// <reference path="DefaultControlEvents.ts" />

module TameGame {
    export interface Game {
        /** The main control router for the game */
        controlRouter?: ControlRouter;

        /** Registers event handlers for controls that apply across the entire game */
        controlEvents?: ControlEvents;
    }
}
