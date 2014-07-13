/// <reference path="RenderTypes.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Actions.ts" />

module TameGame {
    export interface RenderQueue {
        /** 
         * Set the location of the camera for the 2D renderer
         *
         * At the start of rendering, the camera is at position 0,0 with a screen height of 2.
         * This gives coordinates from (-1, -1) to (1, 1).
         */
        moveCamera?: (zIndex: number, center: Point2D, height: number, rotation: number) => void;
    }
    
    // Here's the definition that gets mixed in to any render queue that gets created
    var moveCameraAction = Actions.moveCamera;
    RenderQueueBase.prototype['moveCamera'] = function (zIndex: number, center: Point2D, height: number, rotation: number)  {
        this.addItem({
            action: moveCameraAction,
            zIndex: zIndex,
            intValues: [],
            floatValues: [
                center.x,
                center.y,
                height,
                rotation
            ]
        });
    }
}
