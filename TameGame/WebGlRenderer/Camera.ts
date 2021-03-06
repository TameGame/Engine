/// <reference path="Renderer.ts" />

module TameGame {
    "use strict";

    function cameraInit(renderer: WebGlRenderer) {
        // Return the rendering function
        // See RenderQueue/CameraAction.ts to see where the values come from
        return (item: RenderQueueItem) => {
            renderer.setCamera(item.intValues[0], item.floatValues[0], item.floatValues[1], item.floatValues[2], item.floatValues[3]);
        };
    }
    
    webGlRenderAction[Actions.moveCamera] = cameraInit;
}
