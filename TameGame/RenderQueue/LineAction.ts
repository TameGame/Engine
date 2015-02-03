/// <reference path="Interface.ts" />
/// <reference path="../Algorithms/Algorithms.ts" />
/// <reference path="Actions.ts" />

module TameGame {
    "use strict";

    export interface RenderQueue {
        /**
         * Appends a 'draw line' request
         *
         * Although this is declared '?', all RenderQueue implementations are required to implement it.
         * They do this via the mixInRenderQueueExtensions method
         */
        drawLine?: (color: number[], cameraId: number, zIndex: number, start: Point2D, end: Point2D, matrix: number[]) => void;
    }
    
    // Here's the definition that gets mixed in to everything
    var drawLineAction = Actions.drawLine;
    RenderQueueBase.prototype['drawLine'] = function (color: number[], cameraId: number, zIndex: number, start: Point2D, end: Point2D, width: number, matrix: number[]) {
        this.addItem({
            action:         drawLineAction,
            zIndex:         zIndex,
            intValues:      [ cameraId ],
            floatValues:    [ 
                color[0], color[1], color[2], color[3],
                start.x, start.y,
                end.x, end.y,
                width,
                matrix[0], matrix[3], 0, matrix[6],
                matrix[1], matrix[4], 0, matrix[7],
                0, 0, 1,                 matrix[8],
                matrix[2], matrix[5], 0, 1 ]
        });
    };
}
