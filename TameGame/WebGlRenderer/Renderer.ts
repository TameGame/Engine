/// <reference path="../RenderQueue/RenderQueue.ts" />
/// <reference path="SpriteManager.ts" />

module TameGame {
    "use strict";

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
        constructor(canvas: HTMLCanvasElement) {
            // Sanity check
            if (!canvas) {
                throw ERR_NeedACanvas;
            }

            // Private variables
            var _gl: WebGLRenderingContext;
            var _canvas: HTMLCanvasElement;
            var _actions: WebGlActionMap;
            
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

            // Declare the functions for this object
            
            /**
             * Returns the GL context for this renderer
             */
            function getGl() { return _gl; }
            
            /**
             * Compiles a shader from source
             */
            function compileShader(type: number, source: string): WebGLShader {
                var gl      = _gl;
                
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
                    var error = gl.getShaderInfoLog(shader);
                    gl.deleteShader(shader);
                    
                    console.error('Failed to compile shader: ', error);
                    throw ERR_CantCompileShader;
                }
                
                return shader;
            }
            
            /**
             * Compilers a shader program
             */
            function compileShaderProgram(vertexSource: string, fragmentSource: string): WebGLProgram {
                var gl              = _gl;
                
                // Compile the shaders
                var vertexShader    = compileShader(gl.VERTEX_SHADER, vertexSource);
                var fragmentShader  = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
                
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
            var setCamera = (cameraId: number, centerX: number, centerY: number, height: number, rotationDegrees: number) => {
                // Compute the width to use for the camera transform
                var canvasWidth     = _canvas.width;
                var canvasHeight    = _canvas.height;
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
            };

            /**
             * Renders a queue and performs an optional callback once finished
             */
            var performRender = (queue: RenderQueue): Promise<void> => {
                return new Promise<void>((resolve, reject) => {
                    // Clear the screen
                    var gl      = _gl;
                    var actions = _actions;

                    // Default background colour is an bluish off-white
                    gl.clearColor(0.95,0.98,1,1);
                    gl.clear(gl.COLOR_BUFFER_BIT);

                    // Set up the initial camera
                    setCamera(0, 0, 0, 2.0, 0);

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
            };
            
            // Ready to go
            _gl                         = context;
            _canvas                     = canvas;
            this.cameraMatrix           = {};
            this.getGl                  = getGl;
            this.compileShader          = compileShader;
            this.compileShaderProgram   = compileShaderProgram;
            this.setCamera              = setCamera;
            this.performRender          = performRender;
            this.sprites                = new WebGlSpriteManager(_gl);

            // Initialise the actions
            _actions   = {};
            Object.keys(webGlRenderAction).forEach((actionName) => {
                _actions[actionName] = webGlRenderAction[actionName](this);
            });
        }
        
        /**
         * Returns the GL context for this renderer
         */
        getGl: () => WebGLRenderingContext;
        
        /**
         * Maps camera IDs to the corresponding transformation matrix
         */
        cameraMatrix: { [cameraId: number]: Float32Array };
        
        /**
         * Compiles a shader from source
         */
        compileShader: (type: number, source: string) => WebGLShader;
        
        /**
         * Compilers a shader program
         */
        compileShaderProgram: (vertexSource: string, fragmentSource: string) => WebGLProgram;
        
        /**
         * Sets the camera position
         */
        setCamera: (cameraId: number, centerX: number, centerY: number, height: number, rotationDegrees: number) => void;

        /**
         * Renders a queue and performs an optional callback once finished
         */
        performRender: (queue: RenderQueue) => Promise<void>;
        
        /**
         * The sprite asset manager for this object
         */
        sprites: WebGlSpriteManager;
    }
}
