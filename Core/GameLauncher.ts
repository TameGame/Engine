/// <reference path="Worker.ts" />

module TameGame {
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
        },
    
        /**
         * This callback is made by TameLaunch when it receives the message to start the game
         */
        finishLaunch: (msg: WorkerMessage) => {
            // We'll do something useful here eventually
            console.log("Hello!");
        }
    };
}
