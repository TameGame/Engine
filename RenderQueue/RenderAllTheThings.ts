/// <reference path="../Core/Interface.ts" />
/// <reference path="../Sprite/Camera.ts" />
/// <reference path="Behavior.ts" />

module TameGame {
    var cameraZIndex = -2000000;
    
    /**
     * Installs a renderer that simply calls the render behaviour for all objects in the game
     *
     * Call this before creating any scenes to get the correct behaviour.
     *
     * This is the most basic and most inefficient renderer there is.
     */
    export function renderAllTheThings(game: Game) {
        game.events.onRender(() => {
            // Assign camera IDs to all the active scenes
            var cameraId = 0;
            game.forAllActiveScenes((scene) => {
                ++cameraId;
                scene.cameraId = cameraId;
            });
        });
        
        // Install a rendering function for every scene that gets created
        game.events.onCreateScene((scene) => {
            scene.events.onRender((renderQueue) => {
                if (scene.camera) {
                    // Set the camera for this scene
                    renderQueue.moveCamera(cameraZIndex, scene.cameraId, scene.camera.center, scene.camera.height, scene.camera.rotation);
                
                    // Just render all the objects in this scene - don't bother to try to optimise anything
                    scene.forAllObjects((obj) => {
                        var renderBehavior = obj.getBehavior(RenderBehavior);
                        renderBehavior.render(obj, renderQueue);
                    });
                }
            });
        });
    }
}
