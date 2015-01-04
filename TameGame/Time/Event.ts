/// <reference path="../Core/Core.ts"/>

module TameGame {
    var maxCatchup = 8;

    /**
     * Ensures that a specific event function is fired at a fixed rate
     *
     * The rate is in events per second.
     *
     * If no rate is specified, then the event is fired at a rate of 120/second
     */
    export function fireAtFixedRate<TParameterType>(event: Event<TParameterType>, rate?: number) : Event<TParameterType> {
        var lastFiringTime = 0;

        rate = rate || 120.0;
        var duration = 1000.0 / rate;

        return (param: TParameterType, milliseconds: number, lastMilliseconds: number) => {
            var fireCount =0;

            // Fire at least once if the event isn't continuously firing
            if (lastMilliseconds > lastFiringTime) {
                event(param, lastMilliseconds+duration, lastMilliseconds);
                lastFiringTime = lastMilliseconds+duration;
                ++fireCount;
            }

            // Fire to catch up
            while (lastFiringTime+duration <= milliseconds) {
                // Interrupt the event if it's firing too often
                if (fireCount >= maxCatchup) {
                    lastFiringTime = milliseconds;
                    break;
                }

                // Fire the event
                event(param, lastFiringTime+duration, lastFiringTime);
                lastFiringTime += duration;
                ++fireCount;
            }
        }
    }
}
