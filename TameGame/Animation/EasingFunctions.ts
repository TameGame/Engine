/// <reference path="Interface.ts" />

module TameGame {
    "use strict";

    /**
     * Creates an easing function that accelerates from 0 up until the endpoint (after which the performance is linear)
     */
    var createEaseIn = (endPoint?: number) => {
        // Default value for the endpoint is 0.5
        if (typeof endPoint === 'undefined') {
            endPoint = 0.5;
        }

        // Create an ease-in function
        var result: EasingFunction = (val) => {
            if (val >= endPoint) {
                return val;
            } else {
                var proportion = (val/endPoint);
                var pos = proportion * proportion;

                return pos * endPoint;
            }
        }

        return result;
    };

    /**
     * Creates an easing function that decelerates from the starting point until 1
     */
    var createEaseOut = (startPoint?: number) => {
        // Default value for the start point is 0.5
        if (typeof startPoint === 'undefined') {
            startPoint = 0.5;
        }

        var remaining = 1.0 - startPoint;

        // Create an ease-in function
        var result: EasingFunction = (val) => {
            if (val < startPoint) {
                return val;
            } else {
                var proportion = 1.0-((val-startPoint)/remaining);
                var pos = 1.0-(proportion * proportion);

                return pos*remaining + startPoint;
            }
        }

        return result;
    };

    /**
     * Creates an ease in/out animation function
     */
    var createEaseInOut = (inTo?: number, outFrom?: number) => {
        var inFn    = createEaseIn(inTo);
        var outFn   = createEaseOut(outFrom);

        return (val) => outFn(inFn(val));
    }

    /**
     * Collection of functions that create various types of animation easing function
     */
    export var createEasingFunction = {
        /**
         * Creates an easing function that accelerates from 0 up until the endpoint (after which the performance is linear)
         */
        in: createEaseIn,

        /**
         * Creates an easing function that decelerates from the starting point until 1
         */
        out: createEaseOut,

        /**
         * Creates an ease in/out animation function
         */
        inOut: createEaseInOut
    };
}
