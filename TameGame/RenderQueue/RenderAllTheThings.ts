/// <reference path="../Core/Interface.ts" />
/// <reference path="../Sprite/Camera.ts" />
/// <reference path="Behavior.ts" />
/// <reference path="../Physics/SceneSpace.ts" />

module TameGame {
    "use strict";

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

                    // Ask the scene to render itself
                    scene.behavior.renderScene(scene, renderQueue);
                }
            });
        });
    }

    // Declare how scenes should render themselves by default
    declareBehaviorClass('Scene', {
        renderScene: (scene: Scene, renderQueue: RenderQueue) => {
            // Calculate where the camera is located
            var renderDims  = renderQueue.getDimensions();
            var ratio       = renderDims.width/renderDims.height;
            var height      = scene.camera.height;
            var width       = height * ratio;
            
            var cameraQuad      = bbToQuad({ x: -width/2.0, y: -height/2.0, width: width, height: height });
            var cameraTransform = rotateTranslateMatrix(scene.camera.rotation, scene.camera.center);
            
            cameraQuad = transformQuad(cameraTransform, cameraQuad);
            
            var cameraBB = quadBoundingBox(cameraQuad);

            if (scene.space) {
                // Render only the objects that intersect the camera bounding box
                scene.updateMovedObjects();
                scene.space.forAllInBounds(cameraBB, (ref) => {
                    var renderBehavior = ref.obj.behavior.render;
                    renderBehavior(ref, renderQueue);
                });
            }
        }
    });
}
