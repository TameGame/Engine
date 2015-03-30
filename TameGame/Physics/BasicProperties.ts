/// <reference path="Shape.ts" />
/// <reference path="../Algorithms/Algorithms.ts" />

module TameGame {
    "use strict";

    /**
     * A location describes where an object is located in the world
     */
    export interface ILocation {
        /** Where this object is located */
        pos: Point2D;
        
        /** The angle at which this object is rotated (clockwise, in degrees) */
        angle: number;
    }

    /**
     * The 'presence' describes the physical properties of an object
     */
    export interface IPresence {
        /** The shape of this object. Can be null for objects that can't be collided with */
        shape: Shape;

        /** The mass of this object */
        mass: number;

        /** True if this object is static and shouldn't move */
        isStatic: boolean;

        /** The bounding box of this shape (null or unset if they haven't been calculated yet) */
        bounds?: BoundingBox;
    }
    
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
        location?: ILocation;
        presence?: IPresence;
        motion?: IMotion;
    }

    export var Location: PropertyDefinition<ILocation> = declareProperty("location", () => {
        return {
            pos: { x: 0, y: 0 },
            angle: 0
        };
    });

    export var Presence: PropertyDefinition<IPresence> = declareProperty("presence", () => {
        return {
            shape: null,
            mass: 1,
            isStatic: false,
            bounds: null
        };
    });

    export var Motion: PropertyDefinition<IMotion> = declareProperty("motion", () => {
        return {
            velocity: { x:0, y:0 },
            rotationVelocity: 0
        };
    });
}
