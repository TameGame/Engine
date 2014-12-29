/// <reference path="Interface.ts" />

module TameGame {
    /**
     * Basic implementation of a frame-based animation function
     */
    export class FrameAnimation<TFrameData> implements AnimationWithCallback<TFrameData> {
        constructor(frames: TFrameData[], properties?: AnimationProperties) {
            var startTime: number                   = 0;
            var finishFns: AnimationAction[]        = [];
            var transitionFns: AnimationAction[]    = [];
            var frameFns: FrameAction<TFrameData>[] = [];
            var finished: boolean                   = false;
            var lastTime: number                    = 0;
            var lastProgress: number                = 0;
            var lastFrame: number                   = -1;

            // Copying the frames array ensures that nothing external can modify it underneath us
            frames = frames.slice(0);

            // Fill in missing properties (and create a new properties object to replace the original)
            properties = properties || {};
            properties = {
                duration: properties.duration || 1000.0,
                repeat: properties.repeat || false
            };

            // Specifies the start time for this animation
            var start = (milliseconds: number) => {
                startTime = milliseconds;
                lastTime = milliseconds;
            };

            // Updates the various action functions
            var onTransition = (action: AnimationAction) => {
                transitionFns.push(action);
                return this;
            }
            var onFinish = (action: AnimationAction) => {
                finishFns.push(action);
                return this;
            }
            var onFrame = (action: FrameAction<TFrameData>) => {
                frameFns.push(action);
                return this;
            }

            // Calls the various action functions
            var callTransitions = (progress, timeMillis) => transitionFns.forEach((transition) => transition(progress, timeMillis));
            var callFinish      = (progress, timeMillis) => finishFns.forEach((finish) => finish(progress, timeMillis));
            var callFrame       = (frame, progress, timeMillis) => frameFns.forEach((frameFn) => frameFn(frame, progress, timeMillis));

            // Aborts the animation early
            var finish  = () => {
                finished = true;
                callFinish(lastTime, lastProgress);
            }

            // Performs a tick
            var tick = (milliseconds: number) => {
                // Nothing to do if we're already finished
                if (finished) {
                    return;
                }

                var endTime     = startTime + properties.duration;

                if (milliseconds > endTime) {
                    // If repeating, then reset the animation to the beginning again
                    if (properties.repeat) {
                        // Transitions occur at frame 0
                        while (milliseconds > endTime) {
                            // Update start/end time
                            startTime += properties.duration;
                            endTime = startTime + properties.duration;

                            // Transition occurred at this point in time
                            callTransitions(0.0, startTime);
                        }
                    } else {
                        // Animation finished
                        finished = true;
                        callFinish(1.0, endTime);
                    }
                }

                // Work out the current progress
                var progress    = (milliseconds - startTime) / properties.duration;

                // Track the most recent time/progress of this animation
                lastTime        = milliseconds;
                lastProgress    = progress;

                // Clamp progress
                if (progress < 0.0) {
                    progress = 0.0;
                }
                if (progress > 0.999) {
                    progress = 0.999;
                }

                // Work out which frame we're on
                var frameNum = Math.floor(frames.length * progress);

                // Call the frame callback
                if (lastFrame !== frameNum) {
                    callFrame(frames[frameNum], milliseconds, progress);
                }
            };

            // Store the functions for this object
            this.start          = start;
            this.tick           = tick;
            this.onTransition   = onTransition;
            this.onFinish       = onFinish;
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
        onTransition: (action: AnimationAction) => AnimationWithCallback<TFrameData>;

        /**
         * Performs an action after this animation has finished
         */
        onFinish: (action: AnimationAction) => AnimationWithCallback<TFrameData>;

        /**
         * If this is a repeating animation, runs until the final frame and then stops
         */
        finish: () => void;

        /** 
         * Specifies a callback to be made whenever it's time to generate a new animation frame
         */
        onFrame: (action: FrameAction<TFrameData>) => AnimationWithCallback<TFrameData>;
    }
}
