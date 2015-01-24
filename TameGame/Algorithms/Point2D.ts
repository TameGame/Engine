module TameGame {
    "use strict";

    /**
     * Interface representing a point in 2D space
     */
    export interface Point2D {
        x: number;
        y: number;
    }
    
    /**
     * Interface representing the size of something
     */
    export interface Size {
        width: number;
        height: number;
    }

    /** Calculates the dot product of two vectors*/
    export function dot(p1: Point2D, p2: Point2D) {
        return p1.x*p2.x + p1.y*p2.y;
    }
    
    /**
     * Adds two vectors
     */
    export function addVector(p1: Point2D, p2: Point2D) {
        return { x: p1.x + p2.x, y: p1.y + p2.y };
    }

    /**
     * Subtracts two vectors
     */
    export function subtractVector(p1: Point2D, p2: Point2D) {
        return { x: p1.x - p2.x, y: p1.y - p2.y };
    }
    
    /**
     * Scale a vector by a factor
     */
    export function scaleVector(p: Point2D, factor: number) {
        return { x: p.x * factor, y: p.y * factor };
    }

    /**
     * Works out the magnitude of a vector
     */
     export function magnitude(p1: Point2D) : number {
        return Math.sqrt(p1.x*p1.x + p1.y*p1.y);
     }

     /**
      * Works out the distance between two points
      */
     export function distance(p1: Point2D, p2: Point2D) : number {
        var dX = p1.x - p2.x;
        var dY = p1.y - p2.y;

        return Math.sqrt(dX*dX + dY*dY);
     }
    
    /**
     * Converts a vector to a unit-length vector 
     */
    export function unit(p1: Point2D): Point2D {
        var length = Math.sqrt(p1.x*p1.x + p1.y*p1.y);
        if (length === 0) return p1;
        
        return { x: p1.x/length, y: p1.y/length };
    }
}
