/// <reference path="Interface.ts" />
/// <reference path="../Core/Interface.ts" />

module TameGame {
    "use strict";

    /**
     * Behavior that can be implemented by objects that know how to render themselves
     *
     * Implement this interface and call TameObject.attachBehavior() in order to cause an object
     * to render in a custom manner.
     */
    export interface IRenderBehavior {
        /**
         * Renders the current object
         */
        (obj: any, queue: RenderQueue): void;
    }
    
    export interface Behavior {
        render?: IRenderBehavior;
    }
    
    /**
     * Type definition for object render behaviour
     */
    export var RenderBehavior = declareBehavior<IRenderBehavior>('render', () => {
            return () => {};
    });
}
