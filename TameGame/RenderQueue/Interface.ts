/// <reference path="../Assets/Interface.ts" />

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
         * Actions are assigned unique numbers: presently this is in Actions.ts, and there's no
         * real mechanism for adding new actions. Being able to create new drawing actions is
         * important, however, so this will be added at some later date.
         */
        action: number;
        
        /**
         * The integer values associated with this action
         */
        intValues: number[];
        
        /**
         * The floating point values associated with this action
         */
        floatValues: number[];
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
        
        /**
         * Calls postMessage to send this render queue to the main thread, and clears it.
         */
        postQueue();
        
        /**
         * Fills this queue from a message event (generated by postQueue)
         */
        fillQueue(msg: WorkerMessage);
        
        /**
         * Retrieves the target dimensions, in pixels
         */
        getDimensions(): Size;
    }
    
    /**
     * Interface implemented by objects that describe a renderer
     */
    export interface Renderer {
        /**
         * Renders a queue and performs an optional callback once finished
         */
        performRender(queue: RenderQueue) : Promise<void>;
        
        /**
         * The sprite asset manager for this object
         */
        sprites: SpriteManager;
    }
    
    var nextActionId = 0;
    
    /**
     * Creates a new unique name for a render action
     */
    export function createRenderActionName() {
        ++nextActionId;
        return nextActionId.toString();
    }
    
    /**
     * Base class for all RenderQueues
     *
     * This class can be used to add extensions to the RenderQueue interface. Really TypeScript should
     * have native support for this by making classes open in the same way that interfaces are. However,
     * it doesn't so we have to use a hacky method.
     *
     * To add an action (like drawSprite), extend the RenderQueue interface using a '?' method. Like this:
     *
     *      export interface RenderQueue { newMethod?: (someParameter: number) => void; }
     *
     * Note the need to use lambda syntax and '?'. If you don't use '?', TypeScript will error out because
     * nothing implements the method. After doing this, add the implementation to the RenderQueueBase
     * prototype to supply an implementation for every RenderQueue, like this:
     *
     *      RenderQueueBase.prototype['newMethod'] = function (someParameter: number) { ... }
     *
     * Note the usage of [] notation and 'function' rather than lambda. The [] notation stops TypeScript
     * from claiming the property doesn't exist (sigh), and the function syntax makes 'this' work.
     */
    export class RenderQueueBase implements RenderQueue {
        /**
         * Adds an item to this queue
         */
        addItem(item: RenderQueueItem): RenderQueue { throw "Not implemented"; }
        
        /**
         * Empties this render queue
         */
        clearQueue(): void { throw "Not implemented"; }
        
        /**
         * Sends the actions in this queue to a renderer in the appropriate order
         */
        render(action: (item: RenderQueueItem) => void) { throw "Not implemented"; }
        
        /**
         * Calls postMessage to send this render queue to the main thread, and clears it.
         */
        postQueue() { throw "Not implemented"; }
        
        /**
         * Fills this queue from a message event (generated by postQueue)
         */
        fillQueue(msg: WorkerMessage) { throw "Not implemented"; }
        
        /**
         * Retrieves the target dimensions, in pixels
         */
        getDimensions(): Size { throw "Not implemented"; }
    }
}