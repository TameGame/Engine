/// <reference path="TameGame.d.ts" />

/**
 * Launcher called from the main TameGame process
 */

// Ensure that TameGame is loaded
importScripts('TameGame.js');

// The source script should post an event to let us know it's time to start a game
onmessage = (event: MessageEvent) => {
    // Log the event
    console.log(event);
};
