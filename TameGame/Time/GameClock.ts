/// <reference path="Clock.ts" />
/// <reference path="../Core/Interface.ts" />

module TameGame {
    "use strict";

    export interface Game {
        /**
         * Clock used to schedule events in game
         */
        clock?: Clock;
    }

    export interface Scene {
        /**
         * Clock used to schedule events for this scene
         */
        clock?: Clock;
    }

    export interface TameObject {
        /**
         * Clock used to schedule events for this object
         */
        clock?: Clock;
    }

    /**
     * Registers clock behaviour for a game
     */
    export function clockBehavior(game: Game) {
        game.clock                  = new ClockWatcher(game);
        game.objectPrototype.clock  = game.clock;

        game.events.onCreateScene((scene) => {
            scene.clock = new ClockWatcher(scene);
        });
    }
}
