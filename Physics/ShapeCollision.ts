/// <reference path="../Core/Core.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="SatCollision.ts" />

module TameGame {
    export interface TameObject {
        /** 
         * Optional default priority for processing collisions 
         *
         * This is the value used for the collision priority for this object if the shape
         * collision behaviour does not implement a priority method.
         */
        collisionPriority?: number;
    }
    
    /** 
     * Returns true if two objects have collided
     */
    export function areCollided(a: TameObject, b: TameObject): Collision {
        var aPresence = a.get(Presence);
        var bPresence = b.get(Presence);
        
        if (!aPresence.shape || !bPresence.shape) return null;
        
        var aSat = <SatShape> aPresence.shape.transform(a.transformationMatrix);
        var bSat = <SatShape> bPresence.shape.transform(b.transformationMatrix);
        
        return satCollision(aSat, bSat);
    }
    
    /**
     * Behaviour that describes what happens when two object's shapes collide
     */
    export interface IShapeCollisionBehavior {
        /**
         * Optional function that can be used to supply a collision priority
         *
         * When two objects collide, shapeCollision is called for them both. If they have the
         * same priority then the order is arbitrary. Additionally, if one object returns true
         * to indicate that the collision has been handled, then the other object is not
         * consulted.
         *
         * Objects that return a higher value are processed first. The function can optionally
         * look at the object being collided with to change priorities.
         */
        priority?: (collidedWith: TameObject) => number;
        
        /** 
         * This object has collided with another
         *
         * This should return true if the collision has been handled, or false if it has not
         */
        shapeCollision(collision: Collision, withObject: TameObject, thisObject: TameObject): boolean;
    }
    
    export var ShapeCollisionBehavior: TypeDefinition<IShapeCollisionBehavior> = {
        name: createTypeName(),
        
        createDefault: () => {
            return { 
                shapeCollision: (collision, withObject, thisObject) => { 
                    // The basic collision behaviour is to move the objects so that they are no longer colliding

                    // Get the object presence
                    var presence = thisObject.get(Presence);

                    // The MTV is the minimum distance the objects need to move so that they no longer overlap
                    var mtv = collision.getMtv();

                    // Move the object so that it's no longer collided
                    var oldPos = presence.location;
                    var newPos = { x: presence.location.x + mtv.x, y: presence.location.y + mtv.y };

                    presence.location = newPos;

                    // This effectively handles the collision
                    return true;
                } 
            };
        }
    }
}
