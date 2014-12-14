/// <reference path="Interface.ts" />
/// <reference path="Event.ts" />

module TameGame {
    /** Instruction to the webworker: to start a game defined in a JavaScript file */
    export var workerStartGame          = "start-game";
    
    /** Instruction to the webworker: the state of an input control has changed */
    export var workerInputControl       = "input-control";
    
    /** Instruction to the main thread: render a frame */
    export var workerRenderQueue        = "render-queue";
    
    /** Instruction to the main thread: load a sprite asset */
    export var workerLoadSprite         = "load-sprite";
    
    /** Instruction to the main thread: load a sprite sheet asset */
    export var workerLoadSpriteSheet    = "load-sprite-sheet";

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
                messageEvent.fire(msgData.action, msgData, when);
            }
        }

        /** Registers a handler to be fired when a particular message is received */
        onMessage: FilteredEventRegistration<string, WorkerMessage>;
    }
    
    /** Class that handles messages coming from a webworker */
    export class WorkerMessageHandler {
        constructor(worker: Worker) {
            worker.onmessage = (evt) => {
                // Fetch the message data
                var msgData: WorkerMessage = evt.data;
                
                // Dispatch the message to the appropriate handler
                switch (msgData.action) {
                    case workerRenderQueue:
                        if (this.renderQueue) {
                            this.renderQueue(msgData);
                        }
                        break;

                    case workerLoadSprite:
                        if (this.loadSprite) {
                            this.loadSprite(msgData);
                        }
                        break;
                        
                    case workerLoadSpriteSheet:
                        if (this.loadSpriteSheet) {
                            this.loadSpriteSheet(msgData);
                        }
                        break;
                }
            };
        }
        
        renderQueue:        (msg: WorkerMessage) => void;
        loadSprite:         (msg: WorkerMessage) => void;
        loadSpriteSheet:    (msg: WorkerMessage) => void;
    }
}
