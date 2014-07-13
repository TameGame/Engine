/// <reference path="Interface.ts" />
/// <reference path="RenderTypes.ts" />
/// <reference path="Actions.ts" />

module TameGame {
    export interface RenderQueue {
        /**
         * Appends a draw sprite request
         *
         * Although this is declared '?', all RenderQueue implementations are required to implement it.
         * They do this via the mixInRenderQueueExtensions method
         */
        drawSprite?: (spriteId: number, zIndex: number, position: Quad) => void;
    }
    
    // Here's the definition that gets mixed in to everything
    renderQueueExtensions['drawSprite'] = (queue) => {
        var drawSpriteAction = Actions.drawSprite;
        return (spriteId: number, zIndex: number, position: Quad) => {
            queue.addItem({
                action:         drawSpriteAction,
                zIndex:         zIndex,
                intValues:      [ spriteId ],
                floatValues:    [ position.x1, position.y1, position.x2, position.y2, position.x3, position.y3, position.x4, position.y4 ]
            });
        }
    }
}
