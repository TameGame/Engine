/// <reference path="Interface.ts" />
/// <reference path="../Core/Event.ts" />

module TameGame {
    "use strict";

    /** Records the state of a control */
    interface ControlState extends ControlMap<ControlInput> {}

    /** Pressure required for a control to be considered 'down' */
    var downPressure = 0.5;

    /**
     * Basic implementation of the control events object
     */
    export class DefaultControlEvents implements ControlEvents {
        constructor(inputBinder: InputBinder) {
            // Create the event handlers
            var actionDown      = createFilteredEvent<string, ControlInput>();
            var actionUp        = createFilteredEvent<string, ControlInput>();
            var duringAction    = createFilteredEvent<string, ControlInput>();

            // Objects to store the state of each control at the last tick
            var lastControlState: ControlState = {};

            // True if the specified control is moving to the 'down' state (from the previous control state)
            var controlIsMovingDown = (input: ControlInput, previousState: ControlState) => {
                // If the control pressure is too low, then the control is not moving down
                if (input.pressure < downPressure) {
                    return false;
                }

                // If the control does not exist in the previous state then it is moving down
                if (!previousState[input.device]) {
                    return true;
                }
                if (!previousState[input.device][input.control]) {
                    return true;
                }

                // If the control's pressure in the previous state was too low, then it is moving down
                if (previousState[input.device][input.control].pressure < downPressure) {
                    return true;
                }

                // Not moving down
                return false;
            }

            // True if the specified control is moving to the 'up' state (from the previous control state)
            var controlIsMovingUp = (input: ControlInput, previousState: ControlState) => {
                // If the control pressure is too high, then the control is not moving up
                if (input.pressure >= downPressure) {
                    return false;
                }

                // If the control does not exist in the previous state then it not moving up
                if (!previousState[input.device]) {
                    return false;
                }
                if (!previousState[input.device][input.control]) {
                    return false;
                }

                // If the control's pressure in the previous state was too high, then it is moving up
                if (previousState[input.device][input.control].pressure >= downPressure) {
                    return true;
                }

                // Not moving up
                return false;
            }

            // Function to be called on each tick where inputs are available
            var tickInputs = (inputs: ControlInput[], milliseconds: number, lastMilliseconds: number) => {
                if (!inputs) inputs = [];

                // Create the new control state
                var nextControlState: ControlState      = {};
                var downControls: ControlMap<boolean>   = {};
                var upControls: ControlMap<boolean>     = {};

                inputs.forEach(input => {
                    // Controls with input pressure 0 don't generate events
                    // Ideally these aren't passed into this function, but enforce the rule here too
                    if (input.pressure <= 0) {
                        return;
                    }

                    // Remember the controls that have moved to the 'up' or 'down' states
                    if (controlIsMovingUp(input, lastControlState)) {
                        if (!upControls[input.device]) { upControls[input.device] = {}; }
                        upControls[input.device][input.control] = true;
                    }

                    if (controlIsMovingDown(input, lastControlState)) {
                        if (!downControls[input.device]) { downControls[input.device] = {}; }
                        downControls[input.device][input.control] = true;
                    }

                    // Store the state of this control
                    if (!nextControlState[input.device]) {
                        nextControlState[input.device] = {};
                    }
                    nextControlState[input.device][input.control] = input;
                });

                // Any control that was previously 'down' and is not in the new control state should be marked as up
                forEachControlMap(lastControlState, (control, input) => {
                    // Controls that exist in the next control state have already been processed
                    if (nextControlState[control.device] && nextControlState[control.device][control.control]) {
                        return;
                    }

                    // Controls that didn't have enough pressure in the last control state aren't down
                    if (input.pressure < downPressure) {
                        return;
                    }

                    // This control has been released
                    if (!upControls[input.device]) { upControls[input.device] = {}; }
                    upControls[input.device][input.control] = true;
                });

                // Work out the control actions that have occurred
                // Take the highest-pressure control if two controls map to the same action
                var controlActions: { [action: string]: ControlInput } = {};

                // For each control that has been released, create a default value with pressure 0
                forEachControlMap(upControls, (control) => {
                    var action = inputBinder(control);

                    // Ignore controls that are unbound
                    if (action === null || typeof action === 'undefined') {
                        return;
                    }

                    // Store the value of a control that has been released
                    controlActions[action] = { device: control.device, control: control.control, pressure: 0, when: milliseconds };
                });

                // For each control that has some pressure, store its value in the action
                forEachControlMap(nextControlState, (control, input) => {
                    var action = inputBinder(control);

                    // Ignore controls that are unbound
                    if (action === null || typeof action === 'undefined') {
                        return;
                    }

                    // Store the action for this control, or update it if this is the higher-pressure control
                    var oldAction = controlActions[action];
                    if (!oldAction) {
                        controlActions[action] = input;
                    } else if (input.pressure > oldAction.pressure) {
                        controlActions[action] = input;
                    }
                });

                // Dispatch the events (release events processed first, press, tick)
                Object.keys(controlActions).forEach(action => {
                    // Fire the actions if the control has been released
                    var control = controlActions[action];
                    if (upControls[control.device] && upControls[control.device][control.control]) {
                        actionUp.fire(action, control, milliseconds, lastMilliseconds);
                    }
                });

                Object.keys(controlActions).forEach(action => {
                    // Fire the action if the control has been pressed
                    var control = controlActions[action];
                    if (downControls[control.device] && downControls[control.device][control.control]) {
                        actionDown.fire(action, control, milliseconds, lastMilliseconds);
                    }
                });

                Object.keys(controlActions).forEach(action => {
                    // Fire the action for each tick the control has any pressure on it 
                    var control = controlActions[action];
                    duringAction.fire(action, control, milliseconds, lastMilliseconds);
                });

                // Update the control srtate
                lastControlState = nextControlState;
            };

            // Expose the interface for this object
            this.onActionDown   = actionDown.register;
            this.onActionUp     = actionUp.register;
            this.onDuringAction = duringAction.register;
            this.tickInputs     = tickInputs;
        }

        /**
         * Called once per tick with the status of every control that is 'down' (has a pressure of greater than 0)
         */
        tickInputs: (inputs: ControlInput[], milliseconds: number, lastMilliseconds: number) => void;

        /**
         * Registers an event handler for a particular action, called on the tick when the control is pressed down (pressure reaches greater than 0.5)
         */
        onActionDown: FilteredEventRegistration<string, ControlInput>;

        /**
         * Registers an event handler for a particular action, called on the tick when the control is released (pressure dips below 0.5)
         */
        onActionUp: FilteredEventRegistration<string, ControlInput>;

        /**
         * Registers an event handler for a particular action, called once a tick while a control has a pressure of greater than 0.5
         */
        onDuringAction: FilteredEventRegistration<string, ControlInput>;
    }
}
