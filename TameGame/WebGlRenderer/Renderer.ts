/// <reference path="../RenderQueue/RenderQueue.ts" />
/// <reference path="SpriteManager.ts" />

module TameGame {
    export var ERR_WebGlNotAvailable        = "WebGL is not available in this browser";
    export var ERR_NeedACanvas              = "WebGL initialisation requires a canvas";
    export var ERR_CantCreateShader         = "Unable to create shader";
    export var ERR_CantCompileShader        = "Unable to compile shader";
    export var ERR_CantCreateShaderProgram  = "Unable to create shader program";
    export var ERR_CantLinkShaderProgram    = "Unable to link shader program";
    
    /**
     * Maps render queue action names to an initialiser for a particular renderer (which itself returns the actual action implementation)
     */
    export interface WebGlRenderActionInitialisers {
        [actionName: string]: (renderer: WebGlRenderer) => (item: RenderQueueItem) => void;
    }
    
    /**
     * Maps render queue actions to their implementations
     */
    interface WebGlActionMap {
        [actionName: string]: (item: RenderQueueItem) => void;
    }
    
    /**
     * Implementations for the known render actions
     */
    export var webGlRenderAction: WebGlRenderActionInitialisers = {};
    
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
        private _canvas: HTMLCanvasElement;
        private _actions: WebGlActionMap;
        
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
            this._gl            = context;
            this._canvas        = canvas;
            this.sprites        = new WebGlSpriteManager(this._gl);
            this.cameraMatrix   = {};
            
            // Initialise the actions
            this._actions   = {};
            Object.keys(webGlRenderAction).forEach((actionName) => {
                this._actions[actionName] = webGlRenderAction[actionName](this);
            });
        }
        
        /**
         * Returns the GL context for this renderer
         */
        getGl() { return this._gl; }
        
        /**
         * The camera transformation matrix
         */
        cameraMatrix: { [cameraId: number]: Float32Array };
        
        /**
         * Compiles a shader from source
         */
        compileShader(type: number, source: string): WebGLShader {
            var gl      = this._gl;
            
            // Create a new shader
            var shader  = gl.createShader(type);
            if (!shader) {
                console.error('Failed to create shader');
                throw ERR_CantCreateShader;
            }
            
            // Supply the source
            gl.shaderSource(shader, source);
            
            // Compile it and check for errors
            gl.compileShader(shader);
            
            var compiledOk = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
            if (!compiledOk) {
                gl.deleteShader(shader);
                
                var error = gl.getShaderInfoLog(shader);
                console.error('Failed to compile shader: ', error);
                throw ERR_CantCompileShader;
            }
            
            return shader;
        }
        
        /**
         * Compilers a shader program
         */
        compileShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
            var gl              = this._gl;
            
            // Compile the shaders
            var vertexShader    = this.compileShader(gl.VERTEX_SHADER, vertexSource);
            var fragmentShader  = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
            
            // Create a program
            var program = gl.createProgram();
            if (!program) {
                console.error('Failed to create shader program');
                throw ERR_CantCreateShaderProgram;
            }
            
            // Attach the shaders
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            
            gl.linkProgram(program);
            
            // Check for errors
            var linkedOk = gl.getProgramParameter(program, gl.LINK_STATUS);
            if (!linkedOk) {
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteProgram(program);
                
                var error = gl.getProgramInfoLog(program);
                console.error('Failed to link shader: ', error);
                throw ERR_CantLinkShaderProgram;
            }
            
            return program;
        }
        
        /**
         * Sets the camera position
         */
        setCamera(cameraId: number, centerX: number, centerY: number, height: number, rotationDegrees: number): void {
            // Compute the width to use for the camera transform
            var canvasWidth     = this._canvas.width;
            var canvasHeight    = this._canvas.height;
            var canvasRatio     = canvasWidth / canvasHeight;
            
            var width           = height * canvasRatio;
            
            // Generate rotation
            var rotationRadians = rotationDegrees * Math.PI / 180.0;
            var cosT = Math.cos(rotationRadians);
            var sinT = Math.sin(rotationRadians);
            
            // Generate the matrix
            var x = 2.0/width;
            var y = 2.0/height;
            var u = centerX;
            var v = centerY;
            
            var newMatrix = new Float32Array([
                cosT*x,             sinT*y,                 0,  0,
                -sinT*x,            cosT*y,                 0,  0,
                0,                  0,                      1,  0,
                sinT*v*x-cosT*u*x,  -sinT*u*y-cosT*v*y,     0,  1]);
            
            // This becomes the new camera matrix
            this.cameraMatrix[cameraId] = newMatrix;
        }

        /**
         * Renders a queue and performs an optional callback once finished
         */
        performRender(queue: RenderQueue) : Promise<void> {
            return new Promise<void>((resolve, reject) => {
                // Clear the screen
                var gl = this._gl;
                var actions = this._actions;

                // Default background colour is an bluish off-white
                gl.clearColor(0.95,0.98,1,1);
                gl.clear(gl.COLOR_BUFFER_BIT);

                // Set up the initial camera
                this.setCamera(0, 0, 0, 2.0, 0);

                // Render the queue
                queue.render((item) => {
                    var action = actions[item.action];
                    if (action) {
                        // Perform the action
                        action(item);
                    } else {
                        // Notify the user there's a problem. Replace the action with a default one so we only notify once
                        console.error("Unknown render queue action: " + item.action);
                        actions[item.action] = () => {};
                    }
                });

                // Signal 'done'
                resolve();
            });
        }
        
        /**
         * The sprite asset manager for this object
         */
        sprites: WebGlSpriteManager;
    }
}
