/// <reference path="Interface.ts" />
/// <reference path="Dispatch.ts" />

module TameGame {
    /**
     * Internal class used by the control router
     */
    class BindingEntry {
        binding: InputBinder; priority: number; bindingId: number;
    }

    /**
     * The standard control binder for the game
     */
    export class DefaultControlRouter implements ControlRouter {
        constructor() {
            // Control binding storage
            var nextBindingId = 0;
            var controlBinding: BindingEntry[] = [];

            // Orders two binding entries. High priorities go first, then order so that newer bindings have priority over older ones 
            var orderBindings = (a: BindingEntry, b: BindingEntry) => {
                if (a.priority > b.priority) {
                    return -1;
                } else if (a.priority < b.priority) {
                    return 1;
                } else if (a.bindingId > b.bindingId) {
                    return -1
                } else if (a.bindingId < b.bindingId) {
                    return 1;
                } else {
                    return 0;
                }
            }

            // Everything can be treated as an input binder
            var addInputBinder = (binding: InputBinder, priority?: number) => {
                // Priority is 0 by default
                if (typeof priority === undefined) priority = 0;

                // Assign a unique ID to this binding
                var thisBindingId = nextBindingId;
                ++nextBindingId;

                // Add to the set of control bindings
                controlBinding.push({binding: binding, priority: priority, bindingId: thisBindingId })

                // Sort into order (highest priority first)
                controlBinding.sort(orderBindings);

                // Result is an object that can remove this binding
                return {
                    cancel: () => {
                        // Find the item with our binding ID
                        var foundIndex = -1;
                        var found = controlBinding.some((elem, index) => {
                            if (elem.bindingId === thisBindingId) {
                                foundIndex = index;
                                return true;
                            } else {
                                return false;
                            }
                        });

                        // Remove from the array
                        if (found) {
                            controlBinding.splice(foundIndex, 1);
                        }
                    }
                };
            };

            // Adding a control binding just creates the corresponding input binder and adds it
            var addControlBinding = (binding: ControlBinding, priority?: number) => { 
                var binder: InputBinder = createInputBinder([ binding ]);
                return addInputBinder(binder, priority);
            };

            // Supply an 'overall' input binder which discovers which controls map to which actions
            var actionForInput: InputBinder = (input) => {
                var action: string = null;

                var foundAction = controlBinding.some((binding) => {
                    // Try out this binding
                    var result = binding.binding(input);

                    // The highest priority action with a binding is the one
                    if (result !== null && typeof result !== 'undefined') {
                        action = result;
                        return true;
                    } else {
                        return false;
                    }
                });

                if (foundAction) {
                    return action;
                } else {
                    return null;
                }
            };

            // Set up this object
            this.addControlBinding  = addControlBinding;
            this.addInputBinder     = addInputBinder;
            this.actionForInput     = actionForInput;
        }

        /**
         * Adds a control binding
         *
         * Bindings with high priorities are processed first. If no priority is specified, then the binding
         * is set with priority 0.
         *
         * Priorities matter when there a control is bound to two different actions: only the action with the
         * higher priority is performed.
         *
         * The returned object can be used to remove the binding.
         */
        addControlBinding: (binding: ControlBinding, priority?: number) => Cancellable;

        /**
         * Adds an input binder
         *
         * This will directly map controls to action names, overriding any binding set with addControlBinding. 
         * This may be useful for cases where all inputs need to be processed (such as when allowing users
         * to change their keybindings)
         */
        addInputBinder: (binder: InputBinder, priority?: number) => Cancellable;

        /**
         * Retrieves the action to perform for a particular control input
         *
         * Can be used to query for clashing bindings as well as when dispatching new ones.
         */
        actionForInput: InputBinder;
    }
}
