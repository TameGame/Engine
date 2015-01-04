/// <reference path="Interface.ts" />
/// <reference path="Event.ts" />

module TameGame {
    export var workerMessages = {
        /** Instruction to the webworker: to start a game defined in a JavaScript file */
        startGame: "start-game",
        
        /** Instruction to the webworker: the state of an input control has changed */
        inputControl: "input-control",
        
        /** Instruction to the main thread: render a frame */
        renderQueue: "render-queue",
        
        /** Instruction to the main thread: load a sprite asset */
        loadSprite: "load-sprite",
        
        /** Instruction to the main thread: load a sprite sheet asset */
        loadSpriteSheet: "load-sprite-sheet"
    }

    /** Class that can dispatch messages received from a web worker */
    export class DefaultWorkerMessageDispatcher implements WorkerMessageDispatcher {
        constructor(worker: Worker, getMillseconds?: () => number) {
            // Use Date.now for the event time if no timer is passed in
            if (!getMillseconds) {
                getMillseconds = () => Date.now();
            }

            // Register the event handler
            var messageEvent = createFilteredEvent<string, WorkerMessage>();
            this.onMessage = messageEvent.register;

            // Handle the messages from the worker
            worker.onmessage = (evt) => {
                // Fetch the data for the message
                var msgData: WorkerMessage = evt.data;
                var when = getMillseconds();

                // Dispatch the event
                // These events are independent of the main game clock, so the 'lastMilliseconds' value is the same (they occur instantaneously)
                messageEvent.fire(msgData.action, msgData, when, when);
            }
        }

        /** Registers a handler to be fired when a particular message is received */
        onMessage: FilteredEventRegistration<string, WorkerMessage>;
    }
}
