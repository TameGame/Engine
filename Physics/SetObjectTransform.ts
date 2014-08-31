/// <reference path="BasicProperties.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    export interface TameObject {
        /** Contains the transformation applied to this object by the settings in the Presence properties */
        transformationMatrix?: Float32Array;
    }
    
    /** Whenever the object's Presence properties are changed, update its transformation matrix */
    export function setObjectTransformBehavior(game: Game) {
        game.watch(Presence, UpdatePass.Immediate, (obj, presence) => {
            obj.transformationMatrix = multiplyMatrix(translateMatrix(presence.location), rotationMatrix(presence.rotation));
        }, Priority.FillDerivedValues);
    }
}
