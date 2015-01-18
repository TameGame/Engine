/// <reference path="../Core/Interface.ts" />
/// <reference path="../Sprite/Camera.ts" />
/// <reference path="Behavior.ts" />
/// <reference path="../Physics/SceneQuadTree.ts" />

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

                    // Ask the scene to render itself
                    scene.behavior.render(scene, renderQueue);
                }
            });
        });

        game.events.onRender((renderQueue) => {
            game.behavior.render(game, renderQueue);
        });
    }

    // Declare how scenes should render themselves by default
    declareBehaviorClass('Scene', {
        render: (scene: Scene, renderQueue: RenderQueue) => {
            // Calculate where the camera is located
            var renderDims  = renderQueue.getDimensions();
            var ratio       = renderDims.width/renderDims.height;
            var height      = scene.camera.height;
            var width       = height * ratio;
            
            var cameraQuad      = bbToQuad({ x: -width/2.0, y: -height/2.0, width: width, height: height });
            var cameraTransform = multiplyMatrix(translateMatrix(scene.camera.center), rotationMatrix(scene.camera.rotation));
            
            cameraQuad = transformQuad(cameraTransform, cameraQuad);
            
            var cameraBB = quadBoundingBox(cameraQuad);

            if (scene.quadTree) {
                // Render only the objects that intersect the camera bounding box
                scene.quadTree.forAllInBounds(cameraBB, (obj) => {
                    var renderBehavior = obj.behavior.render;
                    renderBehavior(obj, renderQueue);
                });
            } else {
                // Just render all the objects in this scene - don't bother to try to optimise anything
                scene.forAllObjects((obj) => {
                    var renderBehavior = obj.behavior.render;
                    renderBehavior(obj, renderQueue);
                });
            }
        }
    });
}
