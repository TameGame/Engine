/// <reference path="../Algorithms/Point2D.ts" />

module TameGame {
    /** 
     * Objects implementing the Path interface represent a continuous path through space
     */
    export interface Path {
        /**
         * Returns a point on this path
         *
         * The proportion can be between 0 and one.
         *
         * Points should be in order but do not have to be linearly spaced
         */
        pointAt(proportion: number): Point2D;
    }
}
