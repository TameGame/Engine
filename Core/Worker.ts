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

    /** Instruction to the webworker to start a game defined in a JavaScript file */
    export var workerStartGame = "start-game";
    export var workerRenderQueue = "render-queue";
    
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
                }
            };
        }
        
        /** Action to take when the render queue message arrives */
        renderQueue: (msg: WorkerMessage) => void;
    }
}
