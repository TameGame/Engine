/// <reference path="Point2D.ts" />

module TameGame {
    "use strict";

    /**
     * Interface representing a Quad (4 points)
     */
    export interface Quad {
        /** Top-left coordinate */
        x1: number; y1: number;
        
        /** Top-right coordinate */
        x2: number; y2: number;
        
        /** Bottom-left coordinate */
        x3: number; y3: number;
        
        /** Bottom-right coordinate */
        x4: number; y4: number;
    }
    
    /** Converts a bounding box to a quad */
    export function bbToQuad(bounds: BoundingBox): Quad {
        var minX = bounds.x;
        var minY = bounds.y;
        var maxX = bounds.x+bounds.width;
        var maxY = bounds.y+bounds.height;
        
        return {
            x1: minX, y1: minY,
            x2: maxX, y2: minY,
            x3: maxX, y3: maxY,
            x4: minX, y4: maxY
        };
    }
    
    /**
     * Computes the bounding box of a quad
     */
    export function quadBoundingBox(quad: Quad): BoundingBox {
        var minX = Math.min(quad.x1, quad.x2, quad.x3, quad.x4);
        var minY = Math.min(quad.y1, quad.y2, quad.y3, quad.y4);
        var maxX = Math.max(quad.x1, quad.x2, quad.x3, quad.x4);
        var maxY = Math.max(quad.y1, quad.y2, quad.y3, quad.y4);
        
        return { x: minX, y: minY, width: maxX-minX, height: maxY-minY };
    }
}