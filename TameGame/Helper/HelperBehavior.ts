/// <reference path="../Core/Core.ts" />
/// <reference path="ObjectSetup.ts" />

module TameGame {
    "use strict";

    /**
     * Installs the helper behavior on a game
     */
    export function helperBehavior(game: Game) {
        // The object setup field is contextual (so that it can know which object it's running against)
        // (this means we don't have to initialize the field for every object that's created)
        defineContextualField(game.objectPrototype, "setup", new ContextualObjectSetup());

        // The animate field is also contextual
        defineContextualField(game.objectPrototype, "animate", new ContextualAnimationSetup());
    }
}