/// <reference path="../Core/Core.ts" />

module TameGame {
    /**
     * Represents an action on the render queue
     *
     * In its standard incarnation, TameGame takes the approach of redrawing the entire scene
     * every frame.
     *
     * TameGame buffers up rendering operations for later execution rather than executing them
     * immediately. This makes it possible to abort a rendering operation when the renderer
     * gets behind (so the framerate drops but there's no latency introduced). This also allows
     * for the game to run as a webworker. Finally, this is a mechanism to allow for a 'raw'
     * version of the engine to be produced that runs in v8 JavaScript with a native backend
     * instead of in a browser.
     */
    export interface RenderQueueItem {
        /** 
         * The Z-Index, or ordering of this item
         *
         * Rendering actions are performed from the lowest Z-Index from the highest. Rendering
         * actions that are added to a queue with equal Z-Indexes are performed in the order
         * that they arrived.
         */
        zIndex: number;
        
        /**
         * The action represented by this item
         *
         * In general, every action has an interface defined for it, which should inherit from 
         * RenderQueueItem: this is how the data is stored for each action.
         */
        action: string;
    }
    
    /**
     * A render queue represents a series of rendering operations, which are performed one after 
     * the other
     */
    export interface RenderQueue {
        /**
         * Adds an item to this queue
         */
        addItem(item: RenderQueueItem): RenderQueue;
        
        /**
         * Empties this render queue
         */
        clearQueue(): void;
        
        /**
         * Sends the actions in this queue to a renderer in the appropriate order
         */
        render(action: (item: RenderQueueItem) => void);
    }
}
