/// <reference path="../RenderQueue/RenderQueue.ts" />

module TameGame {
    export var ERR_WebGlNotAvailable    = "WebGL is not available in this browser";
    export var ERR_NeedACanvas          = "WebGL initialisation requires a canvas";
    
    /**
     * The WebGL renderer implements TameGame's rendering functions for browsers that 
     * support WebGL.
     *
     * WebGL is preferred because TameGame uses a 'render entire frame' technique, and
     * also draws sprites as quads and not flat items. These techniques are very slow
     * in most browsers when using the canvas tag. We'll assume that in the future
     * everything will support WebGL and this won't be an issue.
     *
     * Additionally, it's the intention to eventually support a browserless C/C++
     * backend for creating standalone games. This will likely be built around
     * OpenGL or DirectX: this class will provide a convenient basis for this 
     * code.
     */
    export class WebGlRenderer implements Renderer {
        private _gl: WebGLRenderingContext;
        
        constructor(canvas: HTMLCanvasElement) {
            // Sanity check
            if (!canvas) {
                throw ERR_NeedACanvas;
            }
            
            // Try to create a WebGL context
            var possibleContextNames            = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
            var context: WebGLRenderingContext  = null;
            
            possibleContextNames.some((contextName) => {
                try {
                    context = <WebGLRenderingContext> canvas.getContext(contextName, null);
                } catch (e) {
                    context = null;
                    console.log("Could not find WebGL context '" + contextName + "'", e);
                }
                
                if (context && contextName != 'webgl') {
                    console.warn("Using experimental webgl context '" + contextName + "'");
                } else {
                    console.log("Using WebGL context");
                }
                
                return context?true:false;
            });
            
            // If we couldn't create a context, then indicate that WebGL is not available
            if (!context) {
                throw ERR_WebGlNotAvailable;
            }
            
            // Ready to go
            this._gl = context;
        }

        /**
         * Renders a queue and performs an optional callback once finished
         */
        performRender(queue: RenderQueue, done?: () => void) {
            // Clear the screen
            var gl = this._gl;
            
            // Default background colour is an bluish off-white
            gl.clearColor(0.95,0.98,1,1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            // TODO: implement me
        }
        
        /**
         * The sprite asset manager for this object
         */
        sprites: SpriteManager;
    }
}
