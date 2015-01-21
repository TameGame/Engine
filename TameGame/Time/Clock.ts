/// <reference path="../Core/Core.ts" />
/// <reference path="../ThirdParty/DefinitelyTyped/es6-promise.d.ts"/>

module TameGame {
    "use strict";

    /**
     * The clock can be used to generate timed or regular events events
     */
    export interface Clock {
        /**
         * Returns a promise for the next clock tick 
         */
        nextTick(pass?: UpdatePass): Promise<void>;

        /** 
         * Returns a promise that executes after a particular amount of time has passed 
         */
        after(milliseconds: number, pass?: UpdatePass): Promise<void>;

        /**
         * Executes a callback at a regular interval.
         *
         * If ticks take longer than the interval, this will be called multiple times to catch up
         */
        every(callback: () => void, intervalMilliseconds: number, pass?: UpdatePass): Cancellable;

        /**
         * Executes a callback at a regular interval for a limited duration
         */
        until(callback: () => void, intervalMilliseconds: number, durationMilliseconds: number, pass?: UpdatePass): Cancellable;
    }

    /**
     * Queued item for an 'after' promise
     */
    interface AfterQueuedItem {
        when: number;
        resolve: () => void;
    }

    /**
     * Clock implementation that works on a watchable object (like a scene or a game)
     */
    export class ClockWatcher implements Clock {
        constructor(target: Watchable) {
            // We track the 'last' tick in order to determine durations for 'until' and 'after' requests
            var lastTick: number;
            target.everyPass(UpdatePass.Preparation, (milliseconds) => {
                lastTick = milliseconds;
            });

            // Gets a concrete pass from an optional pass
            var getPass = (pass?: UpdatePass) => {
                if (typeof pass === 'undefined') {
                    // Default to high priority
                    return UpdatePass.Preparation;
                } else {
                    return pass;
                }
            }

            // Returns a promise for the next clock tick
            var nextTick = (pass?: UpdatePass): Promise<void> => {
                var result = new Promise<void>((resolve, reject) => {
                    // Resolve the promise on the next tick
                    target.onPass(getPass(pass), () => {
                        resolve();
                    });
                });

                return result;
            };

            var createAfterForPass = (pass: UpdatePass) => {
                // Items waiting for this pass
                var queued: AfterQueuedItem[] = [];

                // Create an event handler for this pass
                target.everyPass(pass, (now) => {
                    // Resolve any queued item that 
                    while (queued.length > 0) {
                        var nextItem = queued[queued.length-1];

                        // Stop when we find the first item that isn't ready to execute
                        if (nextItem.when > now) {
                            break;
                        }

                        // Resolve this item and remove it from the array
                        queued.pop();
                        nextItem.resolve();
                    }
                });

                // The result is a funciton for queuing for this pass
                var queueEvent = (milliseconds: number): Promise<void> => {
                    return new Promise<void>((resolve) => {
                        // Generate the item
                        var newItem: AfterQueuedItem = {
                            when: lastTick+milliseconds,
                            resolve: resolve
                        };

                        // Add it to the queue
                        queued.push(newItem);

                        // Sort into soonest last order (so the last item in the array is the next event to fire)
                        queued.sort((a, b) => {
                            if (a.when < b.when) {
                                return 1;
                            } else if (a.when > b.when) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                    });
                };

                return queueEvent;
            };

            // For each pass that can have an 'after' on it, we have a separate generation function
            var afterForPass: { [pass: number]: { (milliseconds: number): Promise<void> } } = {};

            // Once the clock has started, we can just queue 'after' requests directly
            var afterClockStarted = (milliseconds: number, pass?: UpdatePass): Promise<void> => {
                // Resolve the pass that the event should execute on
                pass = getPass(pass);

                // Get the 'after' tracker for this pass
                var passAfter = afterForPass[pass];
                if (!passAfter) {
                    // Create it if it doesn't exist yet
                    afterForPass[pass] = passAfter = createAfterForPass(pass);
                }

                // Use it to generate the promise
                return passAfter(milliseconds);
            }

            // Before the clock starts, the 'after' function needs to wait for it to start
            var afterClockNotStarted = (milliseconds: number, pass?: UpdatePass): Promise<void> => {
                // Schedule the event on the next tick
                var result = new Promise<void>((resolve) => {
                    target.onPass(UpdatePass.Preparation, (tickTime) => {
                        lastTick = tickTime;
                        afterClockStarted(milliseconds, pass).then(() => resolve());
                    });
                });

                return result;
            }

            // 'every' uses the watchable's everyPass method
            var every = (callback: () => void, intervalMilliseconds: number, pass?: UpdatePass): Cancellable => {
                // Just refuse to register events that occur with daft time intervals
                if (intervalMilliseconds <= 0) {
                    return { cancel: () => {} };
                }

                // Time we expect the next tick to occur
                var nextTick = 0;

                pass = getPass(pass);

                // Register an 'everyPass' handler for this event
                return target.everyPass(pass, (milliseconds, lastMilliseconds) => {
                    // If the next tick should occur outside this time range, move it up into range (this deals with things like scenes stopping their clocks)
                    if (nextTick < lastMilliseconds) {
                        nextTick = lastMilliseconds + intervalMilliseconds;
                    }

                    // Generate ticks until we're caught up
                    while (nextTick < milliseconds) {
                        // Fire the event
                        callback();

                        // Move the clock on
                        nextTick += intervalMilliseconds;
                    }
                });
            };

            // Until is like 'every' except that it cancels after the specified duration has passed
            var until = (callback: () => void, intervalMilliseconds: number, durationMilliseconds: number, pass?: UpdatePass): Cancellable => {
                var cancelEvent: Cancellable = null;
                var cancelled = false;

                // Wait until the next tick to start so that lastTick is guaranteed to be valid
                nextTick().then(() => {
                    if (cancelled) {
                        return;
                    }

                    // Compute the end time
                    var endTime = lastTick + durationMilliseconds;

                    // Re-use every, except that the event gets cancelled if the time passes the end of the event
                    cancelEvent = every(() => {
                        if (lastTick >= endTime) {
                            cancelEvent.cancel();
                        } else {
                            callback()
                        }
                    }, intervalMilliseconds, pass);
                });

                return {
                    cancel: () => {
                        cancelled = true;
                        if (cancelEvent) {
                            cancelEvent.cancel();
                        }
                    }
                };
            };

            // Start the clock on the first tick we receive
            target.onPass(UpdatePass.Preparation, (milliseconds) => {
                lastTick = milliseconds;
                this.after = afterClockStarted;
            });

            // Initialise the properties of this object
            this.nextTick   = nextTick;
            this.after      = afterClockNotStarted;
            this.every      = every;
            this.until      = until;
        }

        /**
         * Returns a promise for the next clock tick 
         */
        nextTick: (pass?: UpdatePass) => Promise<void>;

        /** 
         * Returns a promise that executes after a particular amount of time has passed 
         */
        after: (milliseconds: number, pass?: UpdatePass) => Promise<void>;

        /**
         * Executes a callback at a regular interval.
         *
         * If ticks take longer than the interval, this will be called multiple times to catch up
         */
        every: (callback: () => void, intervalMilliseconds: number, pass?: UpdatePass) => Cancellable;

        /**
         * Executes a callback at a regular interval for a limited duration
         */
        until: (callback: () => void, intervalMilliseconds: number, durationMilliseconds: number, pass?: UpdatePass) => Cancellable;
    }
}
