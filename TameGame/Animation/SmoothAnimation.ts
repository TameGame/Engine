/// <reference path="Interface.ts" />

module TameGame {
    "use strict";

    /**
     * Performs linear animation between two values
     */
    export class SmoothAnimation implements AnimationWithCallback<number> {
        constructor(from: number, to: number, properties: AnimationProperties) {
            // Various variables representing the state of this animation
            var startTime: number                   = 0;
            var finished: boolean                   = false;
            var finishFns: AnimationAction[]        = [];
            var transitionFns: AnimationAction[]    = [];
            var frameFns: FrameAction<number>[]     = [];
            var lastTime: number                    = 0;
            var lastProgress: number                = 0;

            // The functions we're about to declare
            var tick:           (milliseconds: number) => void;
            var startAndTick:   (milliseconds: number) => void;
            var start:          (milliseconds: number) => void;
            var onTransition:   (action: AnimationAction) => AnimationWithCallback<number>;
            var onFinish:       (action: AnimationAction) => AnimationWithCallback<number>;
            var onFrame:        (action: FrameAction<number>) => AnimationWithCallback<number>;
            var finish:         () => void;

            // Get the full set of properties
            properties = properties || {};
            properties = {
                duration:   properties.duration || 1000.0,
                repeat:     properties.repeat || false,
                easing:     properties.easing || ((val) => val)
            };

            // Event registration functions
            onTransition    = (action) => { transitionFns.push(action); return this; }
            onFinish        = (action) => { finishFns.push(action); return this; }
            onFrame         = (action) => { frameFns.push(action); return this; }

            // Start animations functions
            start = (milliseconds) => {
                startTime = milliseconds;

                // Don't allow the animation to start twice
                this.start = () => {};
                this.tick = tick;
            };

            startAndTick = (milliseconds) => {
                start(milliseconds);
                tick(milliseconds);
            };

            // Finish function
            finish = () => {
                // Nothing to do if we're already finished
                if (finished) {
                    return;
                }

                // Indicate that the animation has finished
                finished = true;
                finishFns.forEach((finish) => {
                    finish(lastProgress, lastTime);
                });
            };

            // Tick function
            tick = (milliseconds) => {
                // Nothing to do if the animation is already finished
                if (finished) {
                    return;
                }

                // Nothing to do if the time is before the start
                if (milliseconds < startTime) {
                    return;
                }

                var endTime = startTime + properties.duration;

                // Transition or finish if the time is after the end
                if (milliseconds >= endTime) {
                    if (properties.repeat) {
                        // Perform transitions until we hit a point where we can start the repetition
                        while (milliseconds >= endTime) {
                            transitionFns.forEach((transit) => transit(0.0, endTime));

                            startTime += properties.duration;
                            endTime = startTime + properties.duration;
                        }
                    } else {
                        // Finish the animation
                        finished = true;
                        transitionFns.forEach((transit) => transit(1.0, endTime));
                        finishFns.forEach((finish) => finish(1.0, endTime));
                    }
                }

                // Work out the amount of progress
                var progress = (milliseconds - startTime) / properties.duration;
                if (progress < 0.0) {
                    progress = 0.0;
                }
                if (progress > 1.0) {
                    progress = 1.0;
                }

                // Apply the easing function
                progress = properties.easing(progress);

                // Store the last position (used if finish() is called)
                lastTime        = milliseconds;
                lastProgress    = progress;

                // Update the frame for this animation
                var framePos = progress * (to-from);
                frameFns.forEach((frame) => frame(framePos, progress, milliseconds));
            };

            // Set up the functions for this object
            this.start          = start;
            this.tick           = startAndTick;
            this.onTransition   = onTransition;
            this.onFinish       = onFinish;
            this.onFrame        = onFrame;
            this.finish         = finish;
        }

        /**
         * Specifies the start time for this animation (milliseconds, from a global clock)
         */
        start: (milliseconds: number) => void;

        /** 
         * Updates the objects controlled by this animation to the specified time (milliseconds, from a global clock)
         */
        tick: (milliseconds: number) => void;

        /**
         * Performs an action when this animation reaches its transition point (the point at which it can be replaced by another animation)
         */
        onTransition: (action: AnimationAction) => AnimationWithCallback<number>;

        /**
         * Performs an action after this animation has finished
         */
        onFinish: (action: AnimationAction) => AnimationWithCallback<number>;

        /**
         * If this is a repeating animation, runs until the final frame and then stops
         */
        finish: () => void;

        /** 
         * Specifies a callback to be made whenever it's time to generate a new animation frame
         */
        onFrame: (action: FrameAction<number>) => AnimationWithCallback<number>;
    }
}
