/// <reference path="Clock.ts" />
/// <reference path="../Core/Interface.ts" />

module TameGame {
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

    /**
     * Registers clock behaviour for a game
     */
    export function clockBehavior(game: Game) {
        game.clock = new ClockWatcher(game);

        game.events.onNewScene((scene) => {
            scene.clock = new ClockWatcher(scene);
        });
    }
}
