/// <reference path="Renderer.ts" />

module TameGame {
    function cameraInit(renderer: WebGlRenderer) {
        // Return the rendering function
        return (item: RenderQueueItem) => {
            // The item should be a sprite action item
            var cameraItem = <CameraAction> item;
            
            renderer.setCamera(cameraItem.center.x, cameraItem.center.y, cameraItem.height, cameraItem.rotation);
        };
    }
    
    webGlRenderAction[cameraActionName] = cameraInit;
}
