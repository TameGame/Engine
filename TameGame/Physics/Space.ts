/// <reference path="../Algorithms/Algorithms.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    /**
     * Represents an object in space
     */
    export interface SpaceRef<TObject> {
        /** Removes this object from the space it is in */
        removeObject(): void;

        /** Moves this object to a new location within the current space (or via its parent space). Returns a new reference to the moved object */
        move(newBounds: BoundingBox): SpaceRef<TObject>;

        /** The bounding box of this object */
        bounds: BoundingBox;

        /** The object represented by this item */
        obj: TObject;
    }

    /**
     * The Space interface is implemented by any class that can represent where an object is in space
     *
     * Spaces can contain either objects or other spaces. When searching for objects, spaces are
     * searched recursively and only objects are returned.
     */
    export interface Space<TObject> {
        /** Adds an object to this space, or to a contained space if it is contained by it */
        addObject(obj: TObject, bounds: BoundingBox): SpaceRef<TObject>;

        /** Adds a space to this space */
        addSpace(obj: Space<TObject>, bounds: BoundingBox): SpaceRef<Space<TObject>>;

        /** Performs a callback on all objects that overlap the specified bounding box */
        forAllInBounds(bounds: BoundingBox, callback: (ref: SpaceRef<TObject>) => void): void;

        /** 
         * Finds all possible collision pairs in this space 
         *
         * The two arrays passed in (which should normally be empty) are filled with the collisions that
         * exist in this space. Spaces should use an efficient algorithm to discover objects with
         * overlapping bounding boxes.
         *
         * For every collision, one object is added to left and one to right, representing the two objects
         * that have collided. Provided the arrays are empty (or contain the same number of objects) when
         * this is called, this means that for every index x, there is a collision pair { left[x], right[x] }
         *
         * If two subspaces overlap and contain colliding objects then this call will not generate collision
         * pairs for them.
         */
        findCollisionPairs(left: SpaceRef<TObject>[], right: SpaceRef<TObject>[]): void;
    }
}
