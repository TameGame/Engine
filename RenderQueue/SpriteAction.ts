/// <reference path="Interface.ts" />
/// <reference path="RenderTypes.ts" />

module TameGame {
    /**
     * Render queue item that renders a 2D sprite
     */
    export interface SpriteAction extends RenderQueueItem {
        /** The ID of the sprite that will be drawn by this action */
        spriteId: number;
        
        /** Where the sprite should be drawn */
        position: Quad;
    }
    
    /**
     * Value to put in the 'action' field of a sprite action
     */
    export var spriteActionName = createRenderActionName();
}
