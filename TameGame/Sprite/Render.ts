/// <reference path="../Core/Core.ts" />
/// <reference path="../RenderQueue/RenderQueue.ts" />
/// <reference path="../Physics/BasicProperties.ts" />
/// <reference path="Properties.ts" />
/// <reference path="Camera.ts" />

module TameGame {
    "use strict";

    /**
     * Rendering behaviour for objects that are simple sprites
     */
    var theSpriteRenderBehavior = (ref: SpaceRef<TameObject>, queue: RenderQueue) => {
        // Get the position of this sprite
        var obj         = ref.obj;
        var cameraId    = 0;
        var assetId     = obj.sprite.assetId;
        var tile        = obj.tile;

        if (obj.scene && obj.scene.cameraId) {
            cameraId = obj.scene.cameraId;
        }

        // Render it if it exists
        if (assetId !== -1) {
            var transformedPos = transformQuad(ref.matrix, tile.quad);
            queue.drawSprite(assetId, cameraId, tile.zIndex, transformedPos);
        }
    };
    
    /**
     * Create a 'sprite' behavior to describe how an object with an attached sprite behaves
     */
    declareBehaviorClass('sprite', {
        render: theSpriteRenderBehavior
    });
    
    /**
     * Behaviour, used by default as the 'tSpriteRender' behaviour
     */
    export function spriteRenderBehavior(game: Game) {
        // If a sprite has a non-0 asset ID, then it gets sprite rendering behavior
        game.watch(Sprite, UpdatePass.Immediate, (obj) => {
            // Use a flag so that this only executes once per object
            if (obj['_sRender']) return;
            obj['_sRender'] = true;
            
            if (obj.sprite.assetId !== -1) {
                // Attach the behaviour
                obj.behavior.addClass('sprite');
            } else {
                // Asset ID is -1, so try again next update
                delete obj['_sRender'];
            }
        });
    }
}
