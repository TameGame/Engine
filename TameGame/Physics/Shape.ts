/// <reference path="../Algorithms/Algorithms.ts" />

module TameGame {
    "use strict";

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
        transform(matrix: number[]): Shape;
        
        /** Retrieves the bounding box for this shape (optionally when transformed through a matrix) */
        getBoundingBox(matrix?: number[]): BoundingBox;
        
        /** Finds the center of this shape */
        getCenter(): Point2D;

        /** 'Replays' this shape into a target */
        replay(target: ShapeReplay);
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
        getAxes(testShape: SatShape): Point2D[];
        
        /** Projects the points of this shape onto the specified axis */
        projectOntoAxis(axis: Point2D): Projection;

        /** The closest point on this shape to the specified point */
        closestPoint(point: Point2D): Point2D;
    }
    
    /**
     * A complex shape is one that is made up of other shapes
     */
    export interface ComplexShape extends Shape {
        /** The smaller shapes that make up this one */
        components: Shape[];
    }

    /**
     * Interface used by objects that can 'replay' the contents of a shape
     *
     * This is used to export the contents of a shape as represented by TameGame into a
     * different physics engine.
     */
    export interface ShapeReplay {
        /**
         * Called for shapes that don't have a function in this method
         */
        unknownShape();

        /**
         * Called to indicate that this is a complex shape made up of other shapes
         */
        complexShape?: () => void;

        /**
         * Called for a polygon
         */
        polygon?: (vertices: Point2D[]) => void;

        /**
         * Called for a circle
         */
        circle?: (center: Point2D, radius: number) => void;
    }
}
