/// <reference path="Point2D.ts" />

module TameGame {
    "use strict";
    
    /**
     * Interface representing a bounding box
     */
    export interface BoundingBox extends Point2D, Size {
    }

    /**
     * Interface representing a margin around a rectangular object
     */
    export interface Margin {
        top: number;
        left: number;
        right: number;
        bottom: number;
    }
    
    /**
     * Returns true if the two bounding boxes overlap
     */
    export function bbOverlaps(a: BoundingBox, b: BoundingBox): boolean {
        var aMaxX = a.x + a.width;
        var bMaxX = b.x + b.width;
        
        if (aMaxX < b.x) return false;
        if (bMaxX < a.x) return false;
        
        var aMaxY = a.y + a.height;
        var bMaxY = b.y + b.height;
        
        if (aMaxY < b.y) return false;
        if (bMaxY < a.y) return false;
        
        return true;
    }
    
    /**
     * Returns true if the inner bounding box is entirely inside the outer one
     */
    export function bbContains(outer: BoundingBox, inner: BoundingBox): boolean {
        if (inner.x < outer.x || inner.y < outer.y) { 
            return false;
        }
        
        if (inner.x+inner.width > outer.x+outer.width || inner.y+inner.height > outer.y+outer.height) {
            return false;
        }
        
        return true;
    }
}