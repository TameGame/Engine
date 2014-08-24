/// <reference path="../RenderQueue/RenderTypes.ts" />

module TameGame {
    /**
     * General methods supported by all shapes
     *
     * Shapes are used for collision detection. The basic shape interface doesn't describe
     * enough to actually perform collision detection: implementations should implement one
     * or more of the extension interfaces.
     *
     * SatShape is used for shapes that can support the SAT 
     */
    export interface Shape {
        /** Returns a transformed version of this shape */
        transform(matrix: Float32Array): Shape;
        
        /** Retrieves the bounding box for this shape */
        getBoundingBox(): BoundingBox;
    }
    
    /** 
     * Projection onto an axis
     */
    export interface Projection {
        min: number;
        max: number;
    }
    
    /**
     * Interface implemented by shapes that support SAT (separating axis theorem) collision
     * detection.
     *
     * The separating axis theorem states that for any two convex shapes that are not in
     * collision, an axis can be found that divides them.
     *
     * SAT shapes are convex and have a finite number of axes to test, plus they provide a
     * routine for projecting themselves onto an axis. Typically the axes are the normals
     * for the edges of the shape, and projection is done via the dot product.
     */
    export interface SatShape extends Shape {
        /** The axes to test (the normals of this shape) */
        getAxes(): Point2D[];
        
        /** Projects the points of this shape onto the specified axis */
        projectOntoAxis(axis: Point2D): Projection;
    }
    
    /**
     * A complex shape is one that is made up of other shapes
     */
    export interface ComplexShape extends Shape {
        /** The smaller shapes that make up this one */
        components: Shape[];
    }
}
