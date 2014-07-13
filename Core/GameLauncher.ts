/// <reference path="Worker.ts" />
/// <reference path="Interface.ts" />
/// <reference path="Game.ts" />

module TameGame {
    /** The current game */
    export var game: Game;
    
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
                action: WorkerStartGame,
                data: {
                    gameScript: script
                }
            };
            gameWorker.postMessage(launchMessage);
            
            // Create a way to cancel/stop the game: this is the value that we return
            var result: Cancellable = {
                cancel: () => {
                    gameWorker.terminate();
                }
            };
            
            return result;
        },
    
        /**
         * This callback is made by TameLaunch when it receives the message to start the game
         */
        finishLaunch: (msg: WorkerMessage) => {
            if (msg.action !== WorkerStartGame) {
                throw "finishLaunch must be called with a start game request";
            }
            
            // Set up the game
            // TODO: some means to allow the user to specify modules, which get loaded before we create the game
            game = new StandardGame();
            
            // Run the initial tick before any user code has run
            game.tick(perf.now());
            
            // Get the game loop running
            runWebWorkerGameLoop();
            
            // We should have the ID of a script
            var gameScript = msg.data.gameScript;
            
            // Launch the game
            importScripts(gameScript);
        }
    };
    
    // Use the high-resolution timer if it's available, or shim it with Date if it's not
    var perf: any = {};
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
        // Game ticks 200 times a second
        setInterval(() => {
            game.tick(perf.now());
        }, 5);
    }
    
    /**
     * Runs the in-browser game loop, which renders the current scene as often as possible
     */
    function runBrowserGameLoop(gameWorker) {
    }
}
