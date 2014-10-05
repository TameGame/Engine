/// <reference path="Shape.ts" />
/// <reference path="../RenderQueue/RenderTypes.ts" />

module TameGame {
    /**
     * The 'presence' represents where an object is located in the world as well as what shape it is
     */
    export interface IPresence {
        /** The shape of this object. Can be null for objects that can't be collided with */
        shape: Shape;
        
        /** Where this object is located */
        location: Point2D;
        
        /** The angle at which this object is rotated (clockwise, in degrees) */
        rotation: number;
    }
    
    export interface TameObject {
        presence?: IPresence;
    }

    export var Presence: TypeDefinition<IPresence> = declareProperty("presence", () => {
        return {
            shape: null,
            location: { x: 0, y: 0 },
            rotation: 0
        }
    });
    
    /**
     * Motion represents how an object is moving
     */
    export interface IMotion {
        /** The velocity of this object (rate at which it's moving in units/second) */
        velocity: Point2D;
        
        /** The rotational velocity of this object (in degrees/second) */
        rotationVelocity: number;
    }
    
    export interface TameObject {
        motion?: IMotion;
    }

    export var Motion: TypeDefinition<IMotion> = declareProperty("motion", () => {
        return {
            velocity: { x:0, y:0 },
            rotationVelocity: 0
        }
    });
}
