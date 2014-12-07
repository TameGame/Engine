/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />

module TameGame {
    export interface Game {
        /** The main control router for the game */
        controlRouter?: ControlRouter;

        /** Registers event handlers for controls that apply across the entire game */
        controlEvents?: ControlEvents;
    }
}
