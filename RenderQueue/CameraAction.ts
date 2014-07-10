/// <reference path="RenderTypes.ts" />
/// <reference path="Interface.ts" />

module TameGame {
    /**
     * Action that sets the location of the camera for the 2D renderer
     *
     * At the start of rendering, the camera is at position 0,0 with a screen height of 2.
     * This gives coordinates from (-1, -1) to (1, 1).
     */
    export interface CameraAction extends RenderQueueItem {
        /** Location of the center of the screen */
        center: Point2D;
        
        /** Number of units from the bottom to the top of the screen (width is calculated automatically) */
        height: number;
        
        /** Rotation around the center point, in degrees */
        rotation: number;
    }
    
    /** The name to use in the action field for the camera action */
    export var cameraActionName = createRenderActionName();
}
