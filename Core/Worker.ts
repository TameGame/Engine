module TameGame {
    /**
     * Form of a message passed in to a web worker
     */
    export interface WebWorkerMessage {
        /** The action to take */
        action: string;
    }

    /** Instruction to the webworker to start a game defined in a JavaScript file */
    export var WwStartGame = "start-game";
}
