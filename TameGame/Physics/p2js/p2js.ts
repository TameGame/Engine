/// <reference path="../Physics.ts" />
/// <reference path="p2.d.ts" />

declare var WorkerGlobalScope;

module TameGame {
    "use strict";

    // If we're running in a web worker, load the p2.js file
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
        importScripts("p2.js");
    }
}

/// <reference path="Space.ts" />
/// <reference path="Behavior.ts" />
