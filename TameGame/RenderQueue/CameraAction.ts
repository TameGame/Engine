/// <reference path="RenderTypes.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Actions.ts" />

module TameGame {
    "use strict";

    export interface RenderQueue {
        /** 
         * Set the location of a camera for the 2D renderer
         *
         * Camera IDs are integer values; there can be an unlimited number of cameras in a scene, and IDs can be
         * any value.
         *
         * Cameras apply to all objects above them (typically a camera is placed such that it can be 
         *
         * At the start of rendering, the camera is at position 0,0 with a screen height of 2.
         * This gives coordinates from (-1, -1) to (1, 1).
         */
        moveCamera?: (zIndex: number, cameraId: number, center: Point2D, height: number, rotation: number) => void;
    }
    
    // Here's the definition that gets mixed in to any render queue that gets created
    var moveCameraAction = Actions.moveCamera;
    RenderQueueBase.prototype['moveCamera'] = function (zIndex: number, cameraId: number, center: Point2D, height: number, rotation: number)  {
        this.addItem({
            action: moveCameraAction,
            zIndex: zIndex,
            intValues: [ cameraId ],
            floatValues: [
                center.x,
                center.y,
                height,
                rotation
            ]
        });
    }
}
