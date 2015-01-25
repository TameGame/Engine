/// <reference path="BasicProperties.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    "use strict";

    export interface TameObject {
        /** Contains the transformation applied to this object by the settings in the Presence properties */
        transformationMatrix?: number[];
    }
    
    /** Whenever the object's Presence properties are changed, update its transformation matrix */
    export function setObjectTransformBehavior(game: Game) {
        // TODO: would be nice to have a more formal way of defining 'derived'/'dependent' properties
        // Calculate the transformation matrix lazily
        game.events.onCreateObject(newObj => {
            // Previous dependent values
            var lastX = newObj.location.pos.x;
            var lastY = newObj.location.pos.y;
            var lastRot = newObj.location.angle;

            // The transformation matrix
            var transformationMatrix = rotateTranslateMatrix(newObj.location.angle, newObj.location.pos);

            // Lazily evaluate the transformation matrix when requested
            Object.defineProperty(newObj, 'transformationMatrix', {
                get: () => {
                    var location = newObj.location.pos;
                    var rotation = newObj.location.angle;

                    if (location.x !== lastX || location.y !== lastY || rotation !== lastRot) {
                        // Refresh the matrix
                        transformationMatrix = rotateTranslateMatrix(rotation, location);

                        // Update the position
                        lastX   = location.x;
                        lastY   = location.y;
                        lastRot = rotation;
                    }

                    return transformationMatrix;
                },
                set: value => {
                    transformationMatrix = value;
                }
            });
        });
    }
}
