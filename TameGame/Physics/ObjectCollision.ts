/// <reference path="../Core/Core.ts" />

module TameGame {
    /** 
     * Behavior called when an object is found to be in collision with another one
     */
    export interface IObjectCollisionBehavior {
        /**
         * Callback when two objects are in collision
         */
        collided?: (collidedObj: TameObject, thisObj: TameObject) => void;
    }

    export interface Behavior {
        /** Provides actions when two objects collide */
        objectCollision?: IObjectCollisionBehavior;
    }

    export var ObjectCollisionBehavior = declareBehavior<IObjectCollisionBehavior>('objectCollision', () => {
        // No object collision behavior by default
        return {
            collided: null
        }
    });
}