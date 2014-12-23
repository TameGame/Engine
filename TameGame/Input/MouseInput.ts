/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="../Core/Worker.ts" />
/// <reference path="../Core/GameLauncher.ts" />

module TameGame {
    /**
     * Sends mouse input from an HTML element to a particular game worker
     */
    export var attachMouseInput = (canvas: HTMLElement, targetWorker: Worker) => {
        // We eventually generate a way to stop the mouse input
        var detachMouseInput: Cancellable;

        // When the pointer is over the control, it has a pressure of 1.0
        // (This allows for the game to track the pointer and also detect enter/leave events)
        var pointerPressure = 0.0;

        // Function to send a mouse event to the worker
        var sendMouseEvent = (control: string, location: number[], pressure: number) => {
            var mouseMessage: WorkerMessage = {
                action: workerMessages.inputControl,
                data: {
                    input: {
                        device:     controlDevice.mouse,
                        control:    control,
                        pressure:   pressure,
                        location:   location,
                        when:       perf.now()
                    }
                }
            }

            targetWorker.postMessage(mouseMessage);
        }

        // Function to return the position relative to the canvas as a whole (from 0,0 to 1,1)
        var getPosition = (evt: MouseEvent): number[] => {
            var clientPos   = [ evt.offsetX, evt.offsetY ];
            var canvasSize  = [ canvas.offsetWidth, canvas.offsetHeight ];
            var relativePos = [ clientPos[0]/canvasSize[0], clientPos[1]/canvasSize[1] ];

            return relativePos;
        }

        // Function to determine the control that a particular button maps to
        var controlForButton = (button: number): string => {
            switch (button) {
                case 0:
                    return mouseControl.button1;
                case 1:
                    return mouseControl.button2;
                case 2:
                    return mouseControl.button3;
                case 3:
                    return mouseControl.button4;
                case 4:
                    return mouseControl.button5;

                default:
                    return null;
            }
        }

        // The 'pointer' control has a pressure of 1.0 when the mouse is over the control and 0.0 otherwise
        var onMouseEnter = (evt: MouseEvent) => {
            pointerPressure = 1.0;
            sendMouseEvent(mouseControl.pointer, getPosition(evt), pointerPressure);
        };

        // Leaving the control sets the mouse pressure to 0.0
        var onMouseLeave = (evt: MouseEvent) => {
            pointerPressure = 0.0;
            sendMouseEvent(mouseControl.pointer, getPosition(evt), pointerPressure);
        };

        // Moving the mouse over the control generates a pointer event
        var onMouseMove = (evt: MouseEvent) => {
            sendMouseEvent(mouseControl.pointer, getPosition(evt), pointerPressure);
        };

        // Mouse up/down events
        var onMouseDown = (evt: MouseEvent) => {
            var control = controlForButton(evt.button);
            if (control) {
                sendMouseEvent(control, getPosition(evt), 1.0);
            }

            evt.preventDefault();
        };

        var onMouseUp = (evt: MouseEvent) => {
            var control = controlForButton(evt.button);
            if (control) {
                sendMouseEvent(control, getPosition(evt), 0.0);
            }

            evt.preventDefault();
        };

        // Register the events
        var registered = true;
        canvas.addEventListener('mouseenter', onMouseEnter);
        canvas.addEventListener('mouseleave', onMouseLeave);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);

        // Create the cancellation object
        detachMouseInput = { 
            cancel: () => {
                if (registered) {
                    registered = false;

                    canvas.removeEventListener('mouseenter', onMouseEnter);
                    canvas.removeEventListener('mouseleave', onMouseLeave);
                    canvas.removeEventListener('mousemove', onMouseMove);
                    canvas.removeEventListener('mousedown', onMouseDown);
                    canvas.removeEventListener('mouseup', onMouseUp);
                }
            }
        };

        return detachMouseInput;
    }
}
