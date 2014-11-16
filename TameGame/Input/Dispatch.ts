/// <reference path="Interface.ts" />

module TameGame {
    /**
     * Function that maps a control input to an action
     */
    export interface InputBinder {
        (input: ControlInput): string;
    }

    /**
     * Creates a function that maps a control input to its action name
     *
     * If a control is bound to multiple action names, only the first is used. No warning is generated
     * as this is considered an occasionally useful feature.
     */
    export function createInputBinder(bindings: ControlBinding[]): InputBinder {
        // Maps devices to controls to actions
        var deviceToControlToAction: { [device: string]: { [control: string]: string } } = {};

        // For each binding...
        bindings.forEach(bindingSet => {
            // For each action...
            Object.keys(bindingSet).forEach(actionName => {
                var boundControls = bindingSet[actionName];

                // For each control...
                boundControls.forEach(control => {
                    // Create the control mapping for this device
                    var controlsForDevice = deviceToControlToAction[control.device];
                    if (!controlsForDevice) {
                        controlsForDevice = {};
                        deviceToControlToAction[control.device] = controlsForDevice;
                    }

                    // Create the action mapping if it doesn't exist
                    // This means that if a control is bound to two actions, the first one takes priority
                    if (!controlsForDevice[control.control]) {
                        controlsForDevice[control.control] = actionName;
                    }
                });
            });
        });

        // Create a function to perform the lookup
        return input => {
            if (!input) {
                return null;
            }

            // Get the control mapping for the device
            var deviceControls = deviceToControlToAction[input.device];
            if (!deviceControls) {
                return null;
            }

            // Look up the action name, and return it if it's defined
            var actionName = deviceControls[input.control];
            if (typeof actionName === 'undefined') {
                return null;
            }

            return actionName;
        };
    }

    /**
     * Dispatches control input via a binder to whatever actions are available. If a particular action name appears
     * multiple times in the actions array, it is dispatched multiple times.
     */
    export function dispatchInput(input: ControlInput[], binder: InputBinder, actions: ActionBinding[]) {
        input.forEach(controlInput => {
            // Bind the control
            var actionName = binder(controlInput);

            // Dispatch it
            if (actionName) {
                actions.forEach(action => {
                    if (typeof actions[actionName] !== 'undefined') {
                        actions[actionName](controlInput);
                    }
                })
            }
        });
    }
}
