/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="SatCollision.ts" />

module TameGame {
    /** 
     * Returns true if two objects have collided
     */
    export function areCollided(a: TameObject, b: TameObject): Collision {
        var aPresence = a.get(Presence);
        var bPresence = b.get(Presence);
        
        if (!aPresence.shape || !bPresence.shape) return null;
        
        var aSat = <SatShape> aPresence.shape;
        var bSat = <SatShape> bPresence.shape;
        
        return satCollision(aSat, bSat);
    }
    
    /**
     * Behaviour that describes what happens when two object's shapes collide
     */
    export interface IShapeCollisionBehavior {
        /** 
         * This object has collided with another
         */
        shapeCollision(collision: Collision, withObject: TameObject, thisObject: TameObject);
    }
    
    export var ShapeCollisionBehavior: TypeDefinition<IShapeCollisionBehavior> = {
        name: createTypeName(),
        
        createDefault: () => {
            return { shapeCollision: () => {} };
        }
    }
}
