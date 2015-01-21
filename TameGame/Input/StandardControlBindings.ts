/// <reference path="Interface.ts" />

module TameGame {
    "use strict";

    /**
     * Some well-known control bindings used in many different types of game
     */
    export var standardControls: { [name: string]: ControlBinding } = {
        /** The WASD control layout. Provides up, down, left, right control actions */
        wasd: {
            up: [ { device: controlDevice.keyboard, control: 'W' } ],
            down: [ { device: controlDevice.keyboard, control: 'S' } ],
            left: [ { device: controlDevice.keyboard, control: 'A' } ],
            right: [ { device: controlDevice.keyboard, control: 'D' } ],
        },

        /** The arrow keys control layout. Provides up, down, left, right control actions */
        arrows: {
            up: [ { device: controlDevice.keyboard, control: keyControl.arrowup } ],
            down: [ { device: controlDevice.keyboard, control: keyControl.arrowdown } ],
            left: [ { device: controlDevice.keyboard, control: keyControl.arrowleft } ],
            right: [ { device: controlDevice.keyboard, control: keyControl.arrowright } ],
        },

        /** The mouse control layout: makes it possible to track the pointer and respond to clicks */
        mouse: {
            point: [ { device: controlDevice.mouse, control: mouseControl.pointer }],
            click: [ { device: controlDevice.mouse, control: mouseControl.button1 }],
            rightclick: [ { device: controlDevice.mouse, control: mouseControl.button3 } ],
            middleclick: [ { device: controlDevice.mouse, control: mouseControl.button3 } ]
        }
    };
}