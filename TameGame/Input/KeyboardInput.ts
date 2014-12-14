/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="../Core/Worker.ts" />
/// <reference path="../Core/GameLauncher.ts" />

module TameGame {
    // See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode
    //   keyCode is technically deprecated but seems to be the best approach on Chrome at the moment
    var keyCodeMapping = {
        0x30: '0',
        0x31: '1',
        0x32: '2',
        0x33: '3',
        0x34: '4',
        0x35: '5',
        0x36: '6',
        0x37: '7',
        0x38: '8',
        0x39: '9',
        
        0x41: 'A',
        0x42: 'B',
        0x43: 'C',
        0x44: 'D',
        0x45: 'E',
        0x46: 'F',
        0x47: 'G',
        0x48: 'H',
        0x49: 'I',
        0x4a: 'J',
        0x4b: 'K',
        0x4c: 'L',
        0x4d: 'M',
        0x4e: 'N',
        0x4f: 'O',
        0x50: 'P',
        0x51: 'Q', /* 0xBA: 'Q', // Greek keyboards */
        0x52: 'R',
        0x53: 'S',
        0x54: 'T',
        0x55: 'U',
        0x56: 'V',
        0x57: 'W',
        0x58: 'X',
        0x59: 'Y',
        0x5a: 'Z',
        
        0xbc: ',',
        0xbe: '.',
        0xba: ';',
        0xde: "'",
        0xdb: '(', /* or 0xc0? */
        0xdd: ')', /* or 0xdb? */
        0xc0: '`',
        0xdc: '\\',
        0xbb: '=',
        0xbf: '/',
        0xbd: '-',
        
        0x60: keyControl.numpad0,
        0x61: keyControl.numpad1,
        0x62: keyControl.numpad2,
        0x63: keyControl.numpad3,
        0x64: keyControl.numpad4,
        0x65: keyControl.numpad5,
        0x66: keyControl.numpad6,
        0x67: keyControl.numpad7,
        0x68: keyControl.numpad8,
        0x69: keyControl.numpad9,
        0x6b: keyControl.numpadAdd,
        0xc2: keyControl.numpadComma,
        0x6e: keyControl.numpadPeriod,
        0x6f: keyControl.numpadDivide,
        0x6a: keyControl.numpadMultiply,
        0x6d: keyControl.numpadMinus,
        
        0x12: keyControl.lalt,
        0x14: keyControl.capslock,
        0x11: keyControl.lctrl,
        0x10: keyControl.lshift,
        
        0x0d: keyControl.enter,
        0x20: keyControl.space,
        0x09: keyControl.tab,
        0x2e: keyControl.delete,
        0x23: keyControl.end,
        0x24: keyControl.home,
        0x2d: keyControl.insert,
        0x22: keyControl.pgdown,
        0x21: keyControl.pgup,
        0x28: keyControl.arrowdown,
        0x25: keyControl.arrowleft,
        0x27: keyControl.arrowright,
        0x26: keyControl.arrowup,
        0x1b: keyControl.escape,
        0x08: keyControl.backspace,
        
        0x70: keyControl.f1,
        0x71: keyControl.f2,
        0x72: keyControl.f3,
        0x73: keyControl.f4,
        0x74: keyControl.f5,
        0x75: keyControl.f6,
        0x76: keyControl.f7,
        0x77: keyControl.f8,
        0x78: keyControl.f9,
        0x79: keyControl.f10,
        0x7a: keyControl.f11,
        0x7b: keyControl.f12
    };
    
    /**
     * Sends keyboard input from a canvas to a game worker
     */
    export var attachKeyboardInput = (canvas: HTMLElement, targetWorker: Worker) => {
        // Cancellable for when we no longer want to handle input from the canvas
        var detachKeyboardInput: Cancellable;
        
        // Decodes a keyboard event using a keyCode mapping
        // This is deprecated in newer versions of the standard, but I think it's all that's supported by Chrome at the moment
        var keyCodeToControl = (event: KeyboardEvent) => {
            var control: Control = null;
            
            // Map the control to its basic character
            var mapped = keyCodeMapping[event.keyCode];
            
            // Some controls vary based on location
            if (event.location === 2) { /* right-hand side */
                switch (mapped) {
                    case keyControl.lalt:   mapped = keyControl.ralt; break;
                    case keyControl.lctrl:  mapped = keyControl.rctrl; break;
                    case keyControl.lshift: mapped = keyControl.rshift; break;
                
                    default:
                        // Don't know about a right-hand side of this control
                        mapped = null;
                        break;
                }
            } else if (event.location === 3) { /* Numpad */
                switch (mapped) {
                    case keyControl.enter: mapped = keyControl.numpadEnter; break;
                        
                    default: 
                        // Leave as-is
                        break;
                }
            }
            
            // Set up the control object if we successfully mapped the key
            if (mapped) {
                control = {
                    device: controlDevice.keyboard,
                    control: mapped
                };
            }
            
            return control;
        }
        
        // Converts a key to a Control object
        var keyEventToControl = (event: KeyboardEvent) => {
            // Decode keyCode
            return keyCodeToControl(event);
        };
        
        // Converts a Control to a ControlInput occuring now with a particular pressure
        var controlToInput = (control: Control, pressure: number) => {
            var result: ControlInput = {
                device:     control.device,
                control:    control.control,
                pressure:   pressure,
                when:       perf.now()
            };
            
            return result;
        };
        
        // Attach to key down and key up events events
        // Attaching directly might not play nice with things like JQuery
        var oldKeyDown  = canvas.onkeydown;
        var oldKeyUp    = canvas.onkeyup;
        
        // Attach on the window; assume that the game is the only input target
        // Preventing the default action stops the window from scrolling when the user uses the arrow keys
        window.onkeydown = (keyEvent) => {
            // Convert the event into a 'Control'
            var control = keyEventToControl(keyEvent);
            if (!control) {
                // For debugging, indicate when the key is one we don't know about
                console.log('Unknown key down:', keyEvent);
            }

            if (control) {
                // Post the key event to the worker
                var keyMessage: WorkerMessage = {
                    action: workerMessages.inputControl,
                    data: {
                        input: controlToInput(control, 1.0)
                    }
                };
                targetWorker.postMessage(keyMessage);
            }
            
            keyEvent.preventDefault();
            return true;
        };
        
        window.onkeyup = (keyEvent) => {
            // Convert the event into a 'Control'
            var control = keyEventToControl(keyEvent);
            
            if (control) {
                // Post the key event to the worker
                var keyMessage: WorkerMessage = {
                    action: workerMessages.inputControl,
                    data: {
                        input: controlToInput(control, 0.0)
                    }
                };
                targetWorker.postMessage(keyMessage);
            }
            
            keyEvent.preventDefault();
            return true;
        };
        
        // Generate a detacher
        detachKeyboardInput = {
            cancel: () => {
                canvas.onkeydown    = oldKeyDown;
                canvas.onkeyup      = oldKeyUp;
            }
        };
        
        // Set the tab index and contentEditable attribute so we can actually put focus on the control
        var tabIndex = document.createAttribute("tabindex");
        tabIndex.value = "0";
        canvas.attributes.setNamedItem(tabIndex);
        
        var contentEditable = document.createAttribute("contentEditable");
        tabIndex.value = "true";
        canvas.attributes.setNamedItem(contentEditable);
                
        // Result is the detacher
        return detachKeyboardInput;
    }
}
