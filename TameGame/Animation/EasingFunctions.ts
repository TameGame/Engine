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

        var k = endPoint;
        var a = -2/(k-2);
        var b = 1-a;
        var c = a/(2*k);

        // Create an ease-in function
        var result: EasingFunction = (val) => {
            if (val >= endPoint) {
                return a*val + b;
            } else {
                return c*val*val;
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

        var remaining   = 1.0 - startPoint;
        var easeIn      = createEaseIn(remaining);

        // Create an ease-in function
        var result: EasingFunction = (val) => {
            return 1.0-easeIn(1.0 - val);
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
