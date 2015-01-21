/// <reference path="../Core/Core.ts" />
/// <reference path="../RenderQueue/RenderTypes.ts" />

module TameGame {
    "use strict";

    /**
     * Interface implemented by objects that represent the location of a camera
     */
    export interface CameraLocation {
        /** Center of this camera */
        center: Point2D;
        
        /** Rotation of this camera around the center point */
        rotation: number;
        
        /** Height of the camera viewport (width is always calculated to scale) */
        height: number;
    }
    
    export interface Scene {
        /** Where the camera is located for this scene, or null/undefined if this scene should not be rendered */
        camera?: CameraLocation;
        
        /** The identifier of the camera used to render this scene (or undefined to use camera 0) */
        cameraId?: number;
    }
}
