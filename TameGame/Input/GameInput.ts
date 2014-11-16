/// <reference path="Interface.ts" />
/// <reference path="Dispatch.ts" />
/// <reference path="../Core/Interface.ts" />

module TameGame {
    /**
     * Extension to the game interface to support device input
     *
     * This is the lowest-level part of the control system that can be directly overridden. Typically
     * directly changing control bindings at this point is not required.
     */
    export interface Game {
        /**
         * The input state of a particular control has changed
         */
        controlChanged?: (ControlInput) => void;

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
        addControlBinding?: (binding: ControlBinding, priority?: number) => Cancellable;

        /**
         * Adds an input binder
         *
         * This will directly map controls to action names, overriding any binding set with addControlBinding. 
         * This may be useful for cases where all inputs need to be processed (such as when allowing users
         * to change their keybindings)
         */
        addInputBinder?: (binder: InputBinder) => Cancellable;

        /**
         * Retrieves the action to perform for a particular control input
         *
         * Can be used to query for clashing bindings as well as when dispatching new ones.
         */
        actionForInput?: InputBinder;
    }
}
