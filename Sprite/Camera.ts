/// <reference path="../Core/Core.ts" />

module TameGame {
    export interface Scene {
        /** The identifier of the camera used to render this scene (or undefined to use camera 0) */
        cameraId?: number;
    }
}
