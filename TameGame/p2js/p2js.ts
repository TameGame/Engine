/// <reference path="../Physics/Physics.ts" />
/// <reference path="p2.d.ts" />

module TameGame {
    // Load p2 into the TameGame namespace if possible
    export var p2: any;
    if (importScripts) {
        p2 = importScripts("p2.js");
    }
}
