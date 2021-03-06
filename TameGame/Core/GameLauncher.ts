/// <reference path="Worker.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Game.ts" />
/// <reference path="../Assets/Assets.ts" />
/// <reference path="../WebGlRenderer/WebGlRenderer.ts" />
/// <reference path="../Input/Input.ts" />

module TameGame {
    "use strict";

    /** The current game */
    export var game: Game;
    
    /** The sprite manager for the current game */
    export var sprites: SpriteManager;
    
    /** The data manager for the current game */
    export var data: DataManager;
    
    /**
     * Options that can be used while launching a game
     */
    export interface LaunchOptions {
        /** Empty or the location of the launch script (TameLaunch.js) */
        launchScript?: string;
    }
    
    /**
     * The game launcher is a class whose job it is to actually start a game running
     */
    export var GameLauncher = {
        /**
         * Call launch() to start a game running with a particular canvas
         *
         * Games are run in a seperate web worker. The browser must support WebGL in order for anything
         * to actually happen.
         *
         * You can supply a null script ID, in which case the game will be run using the script tag in
         * the current document with the id 'game'.
         *
         * @param script The name of the JavaScript file containing the game to run
         * @param canvas The canvas where the game should be rendered
         */
        launch: (script: string, canvas: HTMLCanvasElement, options?: LaunchOptions) => {
            // Set up the options
            options                 = options || {};
            options.launchScript    = options.launchScript || 'TameLaunch.js';
        
            // A null script tag instructs us to run an embedded script
            if (!script) {
                var scriptTag   = document.getElementById('game');
                
                if (!scriptTag) {
                    throw "Could not find game script";
                }
                
                var scriptText  = scriptTag.textContent;
                var scriptBlob  = new Blob([scriptText], {type: "text/javascript"});
                script = URL.createObjectURL(scriptBlob);
            }

            // Create the worker
            var gameWorker = new Worker(options.launchScript);
        
            // Tell it which script to run
            var launchMessage: WorkerMessage = {
                action: workerMessages.startGame,
                data: {
                    gameScript: script,
                    canvasSize: { width: canvas.width, height: canvas.height }
                }
            };
            gameWorker.postMessage(launchMessage);
            
            // Set up for keyboard input
            var detachKeyboardInput = attachKeyboardInput(canvas, gameWorker);
            var detachMouseInput    = attachMouseInput(canvas, gameWorker);
            
            // Create a way to cancel/stop the game: this is the value that we return
            var result: Cancellable = {
                cancel: () => {
                    detachKeyboardInput.cancel();
                    detachMouseInput.cancel();
                    gameWorker.terminate();
                }
            };
            
            // Run the browser loop
            runBrowserGameLoop(gameWorker, canvas);
            
            return result;
        },
    
        /**
         * This callback is made by TameLaunch when it receives the message to start the game (in the worker thread)
         */
        finishLaunch: (msg: WorkerMessage, dispatcher: WorkerMessageDispatcher) => {
            if (msg.action !== workerMessages.startGame) {
                throw "finishLaunch must be called with a start game request";
            }
            
            // Set up the game
            // TODO: some means to allow the user to specify modules, which get loaded before we create the game
            game    = new StandardGame(msg.data.canvasSize, dispatcher);
            sprites = new WorkerSpriteManager();
            data    = new AjaxDataManager();
            
            // Run the initial tick before any user code has run
            game.tick(perf.now(), true);
            
            // Whenever we get a render request, send it by posting the queue
            game.events.onPerformRender((queue) => {
                queue.postQueue();
            });
            
            // Get the game loop running
            runWebWorkerGameLoop();
            
            // We should have the ID of a script
            var gameScript = msg.data.gameScript;
            
            // Launch the game
            importScripts(gameScript);
        }
    };
    
    // Use the high-resolution timer if it's available, or shim it with Date if it's not
    export var perf: { now?: () => number } = { now: null };
    perf.now = (function () {
        if (typeof performance !== 'undefined' && performance.now) {
            // Seem to need to wrap in a function or we get Illegal invocation in Chrome
            // (Bug in v8? Can't re-assign native functions)
            return () => performance.now();
        } else {
            console.warn('Using lower-precision timer (performance.now not available)');
            var start = Date.now();
            return () => Date.now() - start;
        }
    })();
    
    /**
     * Runs the 'live' webworker game loop
     */
    function runWebWorkerGameLoop() {
        var lastTick                    = perf.now();
        var lastWarning                 = lastTick;
        var interval                    = 1000.0/240.0;

        var nextTick = lastTick + interval;

        // Game ticks 200 times a second
        setInterval(() => {
            // Get the current time
            var tickTime = perf.now();

            // Update the desired next tick time
            game.tick(tickTime, true);
        }, interval);
    }
    
    /**
     * Runs the in-browser game loop, which renders the current scene as often as possible
     */
    function runBrowserGameLoop(gameWorker: Worker, canvas: HTMLCanvasElement) {
        // Handle the worker messages
        var messageHandler = new DefaultWorkerMessageDispatcher(gameWorker);

        // Create the renderer for this game
        var renderer: Renderer = new WebGlRenderer(canvas);

        // Handle rendering events
        var mostRecentTime: number = 0;
        var mostRecentRenderQueue: RenderQueue = null;
        
        messageHandler.onMessage(workerMessages.renderQueue, (msg: WorkerMessage) => {
            var canvasSize = { width: canvas.width, height: canvas.height };

            // Work out when the message was sent
            var time = msg.data.time;

            // If there's no render queue, then we'll need to render the queue on the next animation frame
            var queueRender = mostRecentRenderQueue === null;

            if (mostRecentRenderQueue === null || time > mostRecentTime) {
                // This message is more recent than the last render request: replace it
                var newQueue = new StandardRenderQueue(canvasSize);
                newQueue.fillQueue(msg);

                mostRecentTime          = time;
                mostRecentRenderQueue   = newQueue;
            }

            // If there's no pending render, then get one queued up
            if (queueRender) {
                requestAnimationFrame(() => {
                    // Render whatever queue is most recent
                    var nextRender = mostRecentRenderQueue;
                    mostRecentRenderQueue = null;

                    if (nextRender) {
                        renderer.performRender(nextRender);
                    }
                });
            }
        });
        
        messageHandler.onMessage(workerMessages.loadSprite, (msg: WorkerMessage) => {
            var assetName   = msg.data.assetName;
            var id          = msg.data.id;
            
            // Pass on to the renderer
            renderer.sprites.loadSprite(assetName, id);
        });
        
        messageHandler.onMessage(workerMessages.loadSpriteSheet, (msg: WorkerMessage) => {
            var assetName   = msg.data.assetName;
            var sheet       = msg.data.sheet;
            
            renderer.sprites.loadSpriteSheet(assetName, sheet);
        });
    }
}
