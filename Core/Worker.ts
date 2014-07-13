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
}
