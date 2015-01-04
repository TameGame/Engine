module TameGame {
    /**
     * Interface implemented by objects that identify a control
     */
    export interface Control {
        /** The name of the device that this control is from */
        device: string;
        
        /** The name of the control that this event is for */
        control: string;
    }
    
    /**
     * Quick way to declare an object that maps a control to a value
     */
    export interface ControlMap<TMapTo> {
        [device: string] : { [control: string]: TMapTo }
    }

    /**
     * Iterates over every value in a control map
     */
    export function forEachControlMap<TMapTo>(map: ControlMap<TMapTo>, iterate: (control: Control, value: TMapTo) => void) {
        Object.keys(map).forEach(device => {
            Object.keys(map[device]).forEach(control => {
                iterate({ device: device, control: control }, map[device][control]);
            });
        });
    }

    /** 
     * Updates a value in a control map 
     */
    export function setControlMap<TMapTo>(map: ControlMap<TMapTo>, control: Control, value: TMapTo) {
        var controlsForDevice = map[control.device];
        if (!controlsForDevice) {
            controlsForDevice = map[control.device] = {};
        }

        controlsForDevice[control.control] = value;
    }

    /**
     * Removes a value from a control map
     */
    export function deleteControlMap<TMapTo>(map: ControlMap<TMapTo>, control: Control) {
        var controlsForDevice = map[control.device];
        if (controlsForDevice) {
            delete controlsForDevice[control.control];
        }
    }

    /**
     * Interface implemented by objects that describe a control input
     */
    export interface ControlInput extends Control {
        /** 
         * The amount of pressure on the control (0 = neutral/released, 1 = fully pressed)
         *
         * This will just be 0 or 1 for controls that don't have any pressure sensitivity
         */
        pressure: number;
        
        /**
         * The time that this control input occurred
         */
        when: number;
        
        /**
         * For controls that represent a pointer (eg, the mouse or the touch controls) this
         * will be the location of the control.
         */
        location?: Point2D;
    }

    /**
     * Interface that describes an object that specifies how in-game actions map to controls
     */
    export interface ControlBinding {
        [actionName: string]: Control[];
    }

    /**
     * Function that maps a control input to an action
     */
    export interface InputBinder {
        (input: Control): string;
    }
    
    /**
     * The control devices known about by TameGame
     */
    export var controlDevice = {
        keyboard: 'keyboard',
        mouse: 'mouse',
        /* touch: 'touch' // When we support it */
        /* gamepad: 'gamepad'   // When we support it */
    };

    /**
     * Interface implemented by objects that can route input bindings
     *
     * This is the lowest-level part of the control system that can be directly overridden. Typically
     * directly changing control bindings at this point is not required.
     */
    export interface ControlRouter {
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

    /**
     * Interface implemented by objects that can register and receive events from controls
     */
    export interface ControlEvents {
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

    /**
     * The condition under which an input action can fire
     */
    export enum ActionTriggerCondition {
        /** Fire when the control pressure exceeds 0.5 */
        OnControlDown,

        /** Fire when teh control pressure falls below 0.5 */
        OnControlUp,

        /** Fire when the control pressure exceeds 0.5 or falls below 0.5 */
        OnControlUpDown,

        /** Fire whenever the control pressure changes */
        OnChange,

        /** Fire on every tick where the control pressure is greater than 0 */
        EveryTickActive,

        /** Fire on every tick */
        EveryTick,
    }
    
    /**
     * Mouse controls
     */
    export var mouseControl = {
        pointer: 'pointer',

        button1: 'button1',
        button2: 'button2',
        button3: 'button3',
        button4: 'button4',
        button5: 'button5',

        wheelup: 'wheelup',
        wheeldown: 'wheeldown'

        /** mouselookup, mouselookdown, mouselookleft, mouselookright - alternative to the pointer if we want 'mouse look' style controls */
    };

    /**
     * Keyboard controls
     *
     * Character controls are just 'a', 'b', etc so they're not listed here
     */
     export var keyControl = {
        lshift:     'lshift',
        lctrl:      'lctrl',
        lalt:       'lalt',
        rshift:     'rshift',
        rctrl:      'rctrl',
        ralt:       'ralt',
        capslock:   'capslock',
        tab:        'tab',
        escape:     'escape',

        home:       'home',
        end:        'end',
        pgup:       'pgup',
        pgdown:     'pgdown',
        'delete':   'delete',
        insert:     'insert',
        backspace:  'backspace',
        enter:      'enter',
        space:      ' ',

        arrowup:    'arrowup',
        arrowleft:  'arrowleft',
        arrowdown:  'arrowdown',
        arrowright: 'arrowright',

        f1: 'f1',
        f2: 'f2',
        f3: 'f3',
        f4: 'f4',
        f5: 'f5',
        f6: 'f6',
        f7: 'f7',
        f8: 'f8',
        f9: 'f9',
        f10: 'f10',
        f11: 'f11',
        f12: 'f12',
        
        numpad1: 'numpad1',
        numpad2: 'numpad2',
        numpad3: 'numpad3',
        numpad4: 'numpad4',
        numpad5: 'numpad5',
        numpad6: 'numpad6',
        numpad7: 'numpad7',
        numpad8: 'numpad8',
        numpad9: 'numpad9',
        numpad0: 'numpad0',
        numpadComma: 'numpad,',
        numpadPeriod: 'numpad.',
        numpadAdd: 'numpad+',
        numpadDivide: 'numpad/',
        numpadMultiply: 'numpad*',
        numpadMinus: 'numpad-',
        numpadEnter: 'numpadEnter',
    };
    
    /**
     * A control binding scheme that can be used to control a menu
     *
     * This is the arrow keys or WASD to move around and change values, plus enter or space to select things. Additionally,
     * it supports the use of the mouse to select things.
     */
    export var menuControlBinding = {
        nextItem: [ { device: controlDevice.keyboard, control: keyControl.arrowdown }, { device: controlDevice.keyboard, control: 's' } ],
        lastItem: [ { device: controlDevice.keyboard, control: keyControl.arrowup }, { device: controlDevice.keyboard, control: 'w' } ],
        nextValue: [ { device: controlDevice.keyboard, control: keyControl.arrowright }, { device: controlDevice.keyboard, control: 'd' } ],
        lastValue: [ { device: controlDevice.keyboard, control: keyControl.arrowleft }, { device: controlDevice.keyboard, control: 'a' } ],
        
        select: [ { device: controlDevice.keyboard, control: keyControl.enter }, { device: controlDevice.keyboard, control: keyControl.space }, { device: controlDevice.mouse, control: mouseControl.button1 } ],
        
        point: [ { device: controlDevice.mouse, control: mouseControl.pointer } ]
    };
}
