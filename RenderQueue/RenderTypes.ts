module TameGame {
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
    
    /**
     * Interface representing a bounding box
     */
    export interface BoundingBox extends Point2D, Size {
    }
}
