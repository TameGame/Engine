/// <reference path="Interface.ts" />

module TameGame {
    interface OnPassCallback {
        (milliseconds: number, lastMilliseconds: number): void;
    }

    /**
     * Represents a set of registered watchers
     */
    export class RegisteredWatchers implements Watchable {
        constructor() {
            var _registered: { [updatePass: number]: { [property: string]: { priority: number; callback: any }[] } }; 
            var _onNextPass: { [updatePass: number]: OnPassCallback[] };
            var _onEveryPass: { [updatePass: number]: OnPassCallback[] };

            _registered = {};
            _onNextPass = {};
            _onEveryPass = {};

            /**
             * When any any object with an attached property of the specified
             * type detects that the contents of that property has changed,
             * call the specified callback.
             *
             * Returns a value that can be used to cancel the watch.
             *
             * Watch notifications are generally not called immediately but when
             * a particular update pass is hit during a game tick.
             */
            function watch<TPropertyType>(definition: TypeDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>, priority?: number): Cancellable {
                // This only deals with deferred updates
                if (updatePass === UpdatePass.Immediate) {
                    throw "Immediate updates are not supported by this object";
                }
                
                if (typeof priority === 'undefined' || priority === null) {
                    priority = 0.0;
                }

                // Get/create the callback array for this pass
                var passCallbacks = _registered[updatePass];
                if (!passCallbacks) {
                    passCallbacks = _registered[updatePass] = {};
                }

                // Get/create the callback array for the property type
                var propertyCallbacks = passCallbacks[definition.name];
                if (!propertyCallbacks) {
                    propertyCallbacks = passCallbacks[definition.name] = [];
                }

                // Register this callback
                propertyCallbacks.push({ priority: priority, callback: callback });
                
                propertyCallbacks.sort((a, b) => {
                    if (a.priority > b.priority) {
                        return 1;
                    } else if (a.priority < b.priority) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                
                // TODO: cancelling
                return { cancel: () => { } };
            }

            /**
             * When this object is part of the active scene and the game hits
             * the specified pass as part of processing a tick, the callback
             * is called, once only.
             */
            function onPass(updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void) {
                var passUpdates = _onNextPass[updatePass];
                if (!passUpdates) {
                    _onNextPass[updatePass] = passUpdates = [];
                }

                passUpdates.push(callback);
            }

            //
            // As for onPass, but the call is made every time this object is part
            // of the active scene and the game hits the specified pass.
            //
            function everyPass(updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void) : Cancellable {
                var passUpdates = _onEveryPass[updatePass];
                if (!passUpdates) {
                    _onEveryPass[updatePass] = passUpdates = [];
                }

                passUpdates.push(callback);

                return { 
                    cancel: () => { 
                        var passUpdates = _onEveryPass[updatePass];
                        if (!passUpdates) {
                            return;
                        }

                        for (var x=0; x<passUpdates.length; ++x) {
                            if (passUpdates[x] === callback) {
                                passUpdates.splice(x, 1);
                                break;
                            }
                        }
                    }
                };
            }

            //
            // Retrieves the registered properties for the specified pass
            //
            function getRegistered(pass: number) { return _registered[pass]; }

            ///
            /// Performs all the queued events for a particular pass
            ///
            function performPassEvents(pass: number, milliseconds: number, lastMilliseconds: number) { 
                var forThisPass = _onNextPass[pass];
                var forEveryPass = _onEveryPass[pass];

                if (forThisPass) {
                    forThisPass.forEach(fn => fn(milliseconds, lastMilliseconds));
                    _onNextPass[pass] = null;
                }

                if (forEveryPass) {
                    forEveryPass.forEach(fn => fn(milliseconds, lastMilliseconds));
                }
            }

            // Initialise the object properties
            this.watch              = watch;
            this.onPass             = onPass;
            this.everyPass          = everyPass;
            this.getRegistered      = getRegistered;
            this.performPassEvents  = performPassEvents;
        }

        /**
         * When any any object with an attached property of the specified
         * type detects that the contents of that property has changed,
         * call the specified callback.
         *
         * Returns a value that can be used to cancel the watch.
         *
         * Watch notifications are generally not called immediately but when
         * a particular update pass is hit during a game tick.
         *
         * The priority value indicates the order in which the watch callbacks
         * are made. Lower values are called earlier. Some well-known priorities
         * are found in the Priority object. A priority of 0 is used if this
         * parameter is not specified.
         */
        watch: (definition: any, updatePass: UpdatePass, callback: any, priority?: number) => Cancellable;          // Using 'any' instead of the generic definitions as TypeScript doesn't seem to support this in lambdas as far as I can see

        /**
         * When this object is part of the active scene and the game hits
         * the specified pass as part of processing a tick, the callback
         * is called, once only.
         */
        onPass: (updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void) => void;

        /**
         * As for onPass, but the call is made every time this object is part
         * of the active scene and the game hits the specified pass.
         */
        everyPass: (updatePass: UpdatePass, callback: (milliseconds: number) => void) => Cancellable;

        /**
         * Retrieves the registered properites for the specified pass
         */
        getRegistered: (pass: number) => { [property: string]: { priority: number; callback: any }[] };

        /**
         * Performs all the queued events for a particular pass
         */
        performPassEvents: (pass: number, milliseconds: number, lastMilliseconds: number) => void;
    }

    /**
     * The watcher notes when objects have changes made and helps
     * with dispatching the relevant events.
     */
    export class Watcher {
        constructor(initialChanges?: { [property: string]: { [id: number]: (callback: any) => void } }) {
            var _changes: { [property: string]: { [id: number]: (callback: any) => void } };

            if (!initialChanges) {
                initialChanges = {};
            }
            _changes = initialChanges;

            //
            // Notes that a property on an object has changed
            //
            function noteChange<TPropertyType>(o: TameObject, property: TypeDefinition<TPropertyType>) {
                var name    = property.name;
                var id      = o.identifier;

                var propertyChanges = _changes[name];
                if (!propertyChanges) {
                    propertyChanges = _changes[name] = {};
                }

                // Create a default callback if none is yet registered for this object
                if (!propertyChanges[id]) {
                    // Create a callback function for this object
                    propertyChanges[id] = (callback) => {
                        callback(o, property.readFrom(o));
                    };
                }
            }

            /**
             * Sends changes to the watchers in a RegisteredWatchers object
             */
            function dispatchChanges(pass: UpdatePass, target: RegisteredWatchers, milliseconds: number, lastMilliseconds: number) {
                // Fetch the list of watchers for this pass
                var watchers = target.getRegistered(pass);
                if (!watchers) {
                    return;
                }

                // For each property, dispatch the events
                var changes = _changes;
                Object.getOwnPropertyNames(changes).forEach((prop) => {
                    // Fetch the callbacks for this property
                    var callbacks = watchers[prop];

                    if (callbacks) {
                        // For every object with a change to this property..
                        var callbackFunctions = changes[prop];
                        Object.keys(callbackFunctions).forEach((objId) => {
                            // Fetch the function that can notify of the change
                            var objCallback = callbackFunctions[objId];

                            // Make the call
                            callbacks.forEach(callback => objCallback(callback.callback));
                        });
                    }
                });
            }

            /**
             * Clear out any changes that might have occurred 
             */
            function clearChanges() {
                _changes = {};
            }
            
            /**
             * Generate a filtered version of this watcher that only applies to the specified object
             * IDs.
             */
            function filter(filterFunc: (objId: number) => boolean): Watcher {
                var newChanges: { [property: string]: { [id: number]: (callback: any) => void } } = {}; 
                
                // Only include objects matched by the filter
                Object.getOwnPropertyNames(_changes).forEach((propertyName) => {
                    var oldPropertyChanges = _changes[propertyName];
                    var newPropertyChanges = newChanges[propertyName] = {};
                    
                    // Using forEach() here would be preferable but it seems to fail the type checks (TypeScript doesn't realise the IDs are numbers)
                    for (var objId in oldPropertyChanges) {
                        if (filterFunc(objId)) {
                            newPropertyChanges[objId] = oldPropertyChanges[objId];
                        }
                    }
                });
                
                return new Watcher(newChanges);
            }

            // Finish up the object
            this.noteChange         = noteChange;
            this.dispatchChanges    = dispatchChanges;
            this.filter             = filter;
            this.clearChanges       = clearChanges;
        }

        /**
         * Notes that a property on an object has changed for later dispatch
         */
        noteChange<TPropertyType>(o: TameObject, property: TypeDefinition<TPropertyType>) { /* Gets replaced */}

        /**
         * Sends changes to the watchers in a RegisteredWatchers object
         */
        dispatchChanges: (pass: UpdatePass, target: RegisteredWatchers, milliseconds: number, lastMilliseconds: number) => void;

        /**
         * Generate a filtered version of this watcher that only applies to the specified object
         * IDs.
         */
        filter: (filterFunc: (objId: number) => boolean) => Watcher;

        /**
         * Clear out any changes that might have occurred 
         */
        clearChanges: () => void;
    }
}
