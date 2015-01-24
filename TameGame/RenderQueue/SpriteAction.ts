/// <reference path="Interface.ts" />
/// <reference path="../Algorithms/Algorithms.ts" />
/// <reference path="Actions.ts" />

module TameGame {
    "use strict";

    export interface RenderQueue {
        /**
         * Appends a draw sprite request
         *
         * Although this is declared '?', all RenderQueue implementations are required to implement it.
         * They do this via the mixInRenderQueueExtensions method
         */
        drawSprite?: (spriteId: number, cameraId: number, zIndex: number, position: Quad) => void;
    }
    
    // Here's the definition that gets mixed in to everything
    var drawSpriteAction = Actions.drawSprite;
    RenderQueueBase.prototype['drawSprite'] = function (spriteId: number, cameraId: number, zIndex: number, position: Quad) {
        this.addItem({
            action:         drawSpriteAction,
            zIndex:         zIndex,
            intValues:      [ spriteId, cameraId ],
            floatValues:    [ position.x1, position.y1, position.x2, position.y2, position.x3, position.y3, position.x4, position.y4 ]
        });
    };
}
