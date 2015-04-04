/// <reference path="Interface.ts" />

module TameGame {
    /**
     * Represents a linear path between two points
     */
    export class LinearPath implements Path {
        constructor(from: Point2D, to: Point2D) {
            var fromX = from.x;
            var fromY = from.y;
            var distX = to.x - fromX;
            var distY = to.y - fromY;

            function pointAt(proportion: number) {
                return { 
                    x: fromX + distX * proportion,
                    y: fromY + distY * proportion
                };
            }

            this.pointAt = pointAt;
        }

        /**
         * Returns a point on this path
         *
         * The proportion can be between 0 and one.
         *
         * Points should be in order but do not have to be linearly spaced
         */
        pointAt: (proportion: number) => Point2D;
    };
}