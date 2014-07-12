/// <reference path="../Core/Interface.ts" />
/// <reference path="Behavior.ts" />

module TameGame {
    /**
     * Installs a renderer that simply calls the render behaviour for all objects in the game
     *
     * Call this before creating any scenes to get the correct behaviour.
     *
     * This is the most basic and most inefficient renderer there is.
     */
    export function renderAllTheThings(game: Game) {
        // Install a rendering function for every scene that gets created
        game.events.onCreateScene((scene) => {
            scene.events.onRender((renderQueue) => {
                // Just render all the objects in this scene - don't bother to try to optimise anything
                scene.forAllObjects((obj) => {
                    var renderBehavior = obj.getBehavior(RenderBehavior);
                    renderBehavior.render(obj, renderQueue);
                });
            });
        });
    }
}
