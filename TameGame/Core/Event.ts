/// <reference path="Interface.ts"/>

module TameGame {
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
        var fire: Event<TParameterType> = (param: TParameterType, milliseconds: number) => {
            for (var eventId in events) {
                events[eventId](param, milliseconds);
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
        var events: { [id: number]: { filterVals: TFilterType[]; action: Event<TParameterType> } } = {};
        
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
            events[eventId] = {
                filterVals: filter,
                action: newEvent
            };
            
            // Create the cancellation object
            return {
                cancel: () => {
                    delete events[eventId];
                }
            };
        }
        
        // Function to fire an event
        var fire: FireFilteredEvent<TFilterType, TParameterType> = (filterValue: TFilterType, param: TParameterType, milliseconds: number) => {
            for (var eventId in events) {
                var thisEvent       = events[eventId];
                var matchesFilter   = thisEvent.filterVals.some((testVal) => testVal === filterValue);
                
                if (matchesFilter) {
                    thisEvent.action(param, milliseconds);
                }
            };
        }
            
        // Result is these two functions
        return {
            register: register,
            fire: fire
        };
    }
}
