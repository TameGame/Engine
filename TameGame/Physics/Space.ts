/// <reference path="../RenderQueue/RenderTypes.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    /**
     * Represents an object in space
     */
    export interface SpaceRef {
        /** Removes this object from the space it is in */
        removeObject(): void;

        /** Moves this object to a new location within the current space (or via its parent space) */
        move(newBounds: BoundingBox): void;
    }

    /**
     * The Space interface is implemented by any class that can represent where an object is in space
     *
     * Spaces can contain either objects or other spaces. When searching for objects, spaces are
     * searched recursively and only objects are returned.
     */
    export interface Space<TObject> {
        /** Adds an object to this space, or to a contained space if it is contained by it */
        addObject(obj: TObject, bounds: BoundingBox): SpaceRef;

        /** Adds a space to this space */
        addSpace(obj: TObject, bounds: BoundingBox): SpaceRef;

        /** Performs a callback on all objects within the specified bounding box */
        forAllInBounds(bounds: BoundingBox, callback: (obj: TObject, bounds: BoundingBox, ref: SpaceRef) => void): void;
    }
}
