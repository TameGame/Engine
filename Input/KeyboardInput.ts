/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />
/// <reference path="../Core/Worker.ts" />

module TameGame {
    /**
     * Sends keyboard input from a canvas to a game worker
     */
    export var attachKeyboardInput = (canvas: HTMLElement, targetWorker: Worker) => {
        // Cancellable for when we no longer want to handle input from the canvas
        var detachKeyboardInput: Cancellable;
        
        // Function to convert a key to a Control object
        var keyEventToControl = (event: KeyboardEvent) => {
            var control: Control = null;
            
            return control;
        };
        
        // Attach to key down and key up events events
        // Attaching directly might not play nice with things like JQuery
        var oldKeyDown  = canvas.onkeydown;
        var oldKeyUp    = canvas.onkeyup;
        
        // Attach on the window; assume that the game is the only input target
        // Preventing the default action stops the window from scrolling when the user uses the arrow keys
        window.onkeydown = (keyEvent) => {
            console.log('Keydown', keyEvent);
            
            keyEvent.preventDefault();
            return true;
        };
        
        window.onkeyup = (keyEvent) => {
            console.log('Keyup', keyEvent);
            
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
