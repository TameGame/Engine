module TameGame {
    /**
     * Form of a message passed in to a web worker
     */
    export interface WorkerMessage {
        /** The action to take */
        action: string;
        
        /** The data for this message */
        data?: any;
    }

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
