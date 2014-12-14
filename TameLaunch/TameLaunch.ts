/// <reference path="TameGame.d.ts" />

/**
 * Launcher called from the main TameGame process
 */

// Ensure that TameGame is loaded into this worker
importScripts('TameGame.js');

(function() {
    // Create a message handler for this game
    var messageEvent = TameGame.createFilteredEvent<string, TameGame.WorkerMessage>();
    var messageDispatcher: TameGame.WorkerMessageDispatcher = { onMessage: messageEvent.register };

    // Launch the game when the source script requests it
    messageDispatcher.onMessage(TameGame.workerMessages.startGame, (msg) => {
        TameGame.GameLauncher.finishLaunch(msg, messageDispatcher);
    });

    // (Debugging) Log info about control events when they arrive
    messageDispatcher.onMessage(TameGame.workerMessages.inputControl, (msg) => {
        console.log(msg.data.input.control);
        console.log(TameGame.perf.now() - msg.data.input.when);
    });

    // The source script should post an event to let us know it's time to start a game
    onmessage = (event: MessageEvent) => {
        var msg: TameGame.WorkerMessage = event.data;
        messageEvent.fire(msg.action, msg, TameGame.perf.now());
    };
})();
