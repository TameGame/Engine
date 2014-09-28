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
         * For controls that represent a pointer (eg, the mouse or the touch controls) this
         * will be the location of the control.
         */
        location?: number[];
    }

    /**
     * Interface that describes an object that specifies how in-game actions map to controls
     */
    export interface ControlBinding {
        [name: string]: Control[]
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
        f12: 'f12'
    };
    
    /**
     * A control binding scheme that can be used to control a menu
     *
     * This is the arrow keys or WASD to move around and change values, plus enter or space to select things.
     */
    export var menuControlBinding = {
        nextItem: [ { device: controlDevice.keyboard, control: keyControl.arrowdown }, { device: controlDevice.keyboard, control: 's' } ],
        lastItem: [ { device: controlDevice.keyboard, control: keyControl.arrowup }, { device: controlDevice.keyboard, control: 'w' } ],
        nextValue: [ { device: controlDevice.keyboard, control: keyControl.arrowright }, { device: controlDevice.keyboard, control: 'd' } ],
        lastValue: [ { device: controlDevice.keyboard, control: keyControl.arrowleft }, { device: controlDevice.keyboard, control: 'a' } ],
        
        select: [ { device: controlDevice.keyboard, control: keyControl.enter }, { device: controlDevice.keyboard, control: keyControl.space } ]
    };
}
