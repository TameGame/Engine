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
        topLeft: Point2D;
        topRight: Point2D;
        bottomLeft: Point2D;
        bottomRight: Point2D;
    }
    
    /**
     * Interface representing a bounding box
     */
    export interface BoundingBox {
        topLeft: Point2D;
        size: Size;
    }
}
