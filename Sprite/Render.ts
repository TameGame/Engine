/// <reference path="../Core/Core.ts" />
/// <reference path="../RenderQueue/RenderQueue.ts" />

module TameGame {
    /**
     * Rendering behaviour for objects that are simple sprites
     */
    class SpriteRenderBehavior implements IRenderBehavior {
        /**
         * Adds rendering actions to the supplied render queue
         */
        render(obj: TameObject, queue: RenderQueue): void {
            // Get the position of this sprite
            var assetId = obj.get(Sprite).assetId;
            var pos     = obj.get(Position);
            
            // Render it if it exists
            if (assetId !== -1) {
                queue.addItem({
                    action: TameGame.spriteActionName,
                    zIndex: pos.zIndex,
                    spriteId: assetId,
                    position: pos
                });
            }
        }
    }
    
    var theSpriteRenderBehavior = new SpriteRenderBehavior();
    
    /**
     * Behaviour, used by default as the 'tSpriteRender' behaviour
     */
    export function spriteRenderBehavior(game: Game) {
        // If a sprite has a non-0 asset ID, then it gets sprite rendering behavior
        game.watch(Sprite, UpdatePass.Immediate, (obj, newValue) => {
            // Use a flag so that this only executes once per object
            if (obj['_sRender']) return;
            obj['_sRender'] = true;
            
            if (obj.get(Sprite).assetId !== -1) {
                // Attach the behaviour
                obj.attachBehavior(RenderBehavior, theSpriteRenderBehavior);
            } else {
                // Asset ID is -1, so try again next update
                delete obj['_sRender'];
            }
        });
    }
}
