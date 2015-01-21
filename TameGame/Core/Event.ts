/// <reference path="Interface.ts"/>

module TameGame {
    "use strict";

    /**
     * Creates the functions required to register and fire an event
     */
    export function createEvent<TParameterType>() {
        // The ID to assign to the next event
        var nextId = 0;
        
        // The registered events
        var events: { [id: number]: Event<TParameterType> } = {};
        
        // Function to register an event
        var register: EventRegistration<TParameterType> = (newEvent) => {
            // null events do nothing
            if (!newEvent) {
                return { cancel: () => {} };
            }
            
            // Assign an ID to this event
            var eventId = nextId;
            ++nextId;
            
            // Register
            events[eventId] = newEvent;
            
            // Create the cancellation object
            return {
                cancel: () => {
                    delete events[eventId];
                }
            };
        }
        
        // Function to fire an event
        var fire: Event<TParameterType> = (param: TParameterType, milliseconds: number, lastMilliseconds: number) => {
            for (var eventId in events) {
                events[eventId](param, milliseconds, lastMilliseconds);
            }
        }
            
        // Result is these two functions
        return {
            register: register,
            fire: fire
        };
    }
    
    export function createFilteredEvent<TFilterType, TParameterType>() {
        // The ID to assign to the next event
        var nextId = 0;
        
        // The registered events
        var events: { filterVals: TFilterType[]; action: Event<TParameterType>; id: number; }[] = [];
        
        // Function to register an event
        var register: FilteredEventRegistration<TFilterType, TParameterType> = (filter, newEvent) => {
            // null events do nothing
            if (!newEvent) {
                return { cancel: () => {} };
            }
            
            if (!(filter instanceof Array)) {
                filter = [ filter ];
            }
            
            // Assign an ID to this event
            var eventId = nextId;
            ++nextId;
            
            // Register
            events.push({
                filterVals: filter,
                action:     newEvent,
                id:         eventId
            });
            
            // Create the cancellation object
            return {
                cancel: () => {
                    for (var eventNum=0; eventNum < events.length; ++eventNum) {
                        if (events[eventNum].id == eventId) {
                            events.splice(eventNum, 1);
                            return;
                        }
                    }
                }
            };
        }
        
        // Function to fire an event
        var fire: FireFilteredEvent<TFilterType, TParameterType> = (filterValue: TFilterType, param: TParameterType, milliseconds: number, lastMilliseconds: number) => {
            events.forEach(thisEvent => {
                var matchesFilter   = thisEvent.filterVals.some((testVal) => testVal === filterValue);
                
                if (matchesFilter) {
                    thisEvent.action(param, milliseconds, lastMilliseconds);
                }
            });
        }
            
        // Result is these two functions
        return {
            register: register,
            fire: fire
        };
    }
}
