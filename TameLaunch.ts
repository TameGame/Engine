/// <reference path="TameGame.d.ts" />

/**
 * Launcher called from the main TameGame process
 */

// Ensure that TameGame is loaded
importScripts('TameGame.js');

// The source script should post an event to let us know it's time to start a game
onmessage = (event: MessageEvent) => {
    var msg: TameGame.WorkerMessage = event.data;
    
    // Finish the launch once we receive a suitable event
    switch (msg.action) {
        case TameGame.WorkerStartGame:
            TameGame.GameLauncher.finishLaunch(msg);
            break;
    }
};
