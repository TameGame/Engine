/// <reference path="Interface.ts" />

module TameGame {
    "use strict";

    interface OnPassCallback {
        (milliseconds: number, lastMilliseconds: number): void;
    }

    /**
     * Represents a set of registered watchers
     */
    export class RegisteredWatchers implements Watchable {
        constructor() {
            var _registered: { [updatePass: number]: { [property: string]: { priority: number; callback: { (o: TameObject, val: any): void } }[] } }; 
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
            function watch<TPropertyType>(definition: PropertyDefinition<TPropertyType>, updatePass: UpdatePass, callback: PropertyChangedCallback<TPropertyType>, priority?: number): Cancellable {
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
                var propertyCallbacks = passCallbacks[definition.givenName];
                if (!propertyCallbacks) {
                    propertyCallbacks = passCallbacks[definition.givenName] = [];
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
                var forThisPass     = _onNextPass[pass];
                var forEveryPass    = _onEveryPass[pass];

                if (forThisPass) {
                    forThisPass.forEach(fn => fn(milliseconds, lastMilliseconds));
                    _onNextPass[pass] = null;
                }

                if (forEveryPass) {
                    forEveryPass = forEveryPass.slice();
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
        watch<TPropertyType>(definition: PropertyDefinition<TPropertyType>, updatePass: UpdatePass, callback: any, priority?: number): Cancellable {
            /* Empty definition to work around typescript's inability to declare generic lambdas */
            return null;
        }

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
        everyPass: (updatePass: UpdatePass, callback: (milliseconds: number, lastMilliseconds: number) => void) => Cancellable;

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
        constructor(initialChanges?: { [property: string]: { [id: number]: TameObject } }) {
            var _propertyChangers: { [property: string]: (o: TameObject) => void };
            var _clearChange: { [property: string]: () => void };
            var _getChange: { [property: string]: () => { [id: number]: TameObject } };
            var _startPass: { [ property: string]: () => void };
            var _endPass: { [ property: string]: () => void };

            if (!initialChanges) {
                initialChanges = {};
            }
            _propertyChangers   = {};
            _clearChange        = {};
            _getChange          = {};
            _startPass          = {};
            _endPass            = {};

            //
            // Retrieves a function that can be called to notify a change to a particular property
            //
            function getNoteForPropertyName(name: string): (o: TameObject) => void {
                if (!_propertyChangers[name]) {
                    (function () {
                        var currentChanges  = initialChanges[name] || {};
                        var nextChanges     = currentChanges;

                        // Flags this property as changed
                        _propertyChangers[name] = function (o: TameObject) {
                            var id      = o.identifier;
                            nextChanges[id] = o;
                        };

                        // Clears all of the changes known about for this property
                        _clearChange[name] = function () {
                            nextChanges = {};
                        };

                        // Returns the changes for this property
                        _getChange[name] = function () {
                            return currentChanges;
                        };

                        // Starts a pass
                        _startPass[name] = function() {
                            // Stores up changes that occur during this pass for the next one, and freezes the current set of changes
                            nextChanges = {};
                        };

                        // Finishes an update pass
                        _endPass[name] = function() {
                            // Process any changes that occured during the current pass during the next pass
                            currentChanges = nextChanges;
                        };
                    })();
                }

                return _propertyChangers[name];
            }

            function getNoteForProperty<TPropertyType>(prop: PropertyDefinition<TPropertyType>): (o: TameObject) => void {
                return getNoteForPropertyName(prop.givenName);
            }

            /**
             * Returns all of the changes that apply to a particular property
             */
            function getChanges(property: string): { [id: number]: TameObject } {
                var changes = _getChange[property];
                if (changes) {
                    return changes();
                } else {
                    return {};
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
                Object.getOwnPropertyNames(_getChange).forEach((prop) => {
                    // Fetch the callbacks for this property
                    var callbacks = watchers[prop];

                    if (callbacks) {
                        // For every object with a change to this property...
                        var changes = _getChange[prop]();
                        Object.keys(changes).forEach((objId) => {
                            // Fetch the function that can notify of the change
                            var changedObj = changes[objId];
                            var propValue = changedObj[prop];

                            // Make the call
                            callbacks.forEach(callback => callback.callback(changedObj, propValue));
                        });
                    }
                });
            }

            /**
             * Clear out any changes that might have occurred 
             */
            function clearChanges() {
                Object.keys(_clearChange).forEach((propName) => {
                    _clearChange[propName]();
                    initialChanges = {};
                });
            }

            /**
             * Starts an update pass
             *
             * This freezes the current set of changes and stores any future changes for the next pass.
             */
            function startPass() {
                Object.keys(_startPass).forEach((propName) => {
                    _startPass[propName]();
                    initialChanges = {};
                });
            }

            /**
             * Ends an update pass
             *
             * This unfreezes the changes frozen by startPass and makes them available
             */
            function endPass() {
                Object.keys(_endPass).forEach((propName) => {
                    _endPass[propName]();
                    initialChanges = {};
                });
            }

            /**
             * Generate a filtered version of this watcher that only applies to the specified object
             * IDs.
             */
            function filter(filterFunc: (objId: number) => boolean): Watcher {
                var newChanges: { [property: string]: { [id: number]: TameObject } } = {}; 
                
                // Only include objects matched by the filter
                Object.getOwnPropertyNames(_getChange).forEach((propertyName) => {
                    var oldPropertyChanges = _getChange[propertyName]();
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

            // Initialise anything that has an initial change (so that filtering works)
            Object.keys(initialChanges).forEach((propName) => getNoteForPropertyName(propName));

            // Finish up the object
            this.getNoteForProperty = getNoteForProperty;
            this.dispatchChanges    = dispatchChanges;
            this.filter             = filter;
            this.clearChanges       = clearChanges;
            this.startPass          = startPass;
            this.endPass            = endPass;
            this.getChanges         = getChanges;
        }

        /**
         * Retrieves a function that logs a change for the specified property
         */
        getNoteForProperty<TPropertyType>(property: PropertyDefinition<TPropertyType>): (o: TameObject) => void { return null; /* Here because TypeScript can't support generic lambdas */ }

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

        /**
         * Starts an update pass
         *
         * This freezes the current set of changes and stores any future changes for the next pass.
         */
        startPass: () => void;

        /**
         * Ends an update pass
         *
         * This makes the 'future' changes cached after startPass the 'current' changes, ready for the next pass
         */
        endPass: () => void;

        /**
         * Returns all of the changes that apply to a particular property
         */
        getChanges: (property: string) => { [id: number]: TameObject };
    }
}
