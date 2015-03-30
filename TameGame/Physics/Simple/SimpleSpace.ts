/// <reference path="../Space.ts" />
/// <reference path="../../Algorithms/Algorithms.ts" />

module TameGame {
    "use strict";

    interface SimpleSpaceObject<TObject> extends SpaceRef<TObject> {
        id: number;
    }

   /**
     * Basic space class that does not perform any explicit subdivision
     */
    export class SimpleSpace<TObject> implements Space<TObject> {
        constructor() {
            var nextId: number                              = 0;
            var objects: SimpleSpaceObject<TObject>[]       = [];
            var spaces: SimpleSpaceObject<Space<TObject>>[] = [];
            var sorted: boolean                             = true;

            // Calculates the transformation matrix for a particular location
            function calculateMatrix(where: SpaceLocation): number[] {
                // Compute the transformation matrix for this location
                var location    = where.location;
                var transform   = rotateTranslateMatrix(location.angle, location.pos);

                // Result is the bounding box transformed by the matri
                return transform;
            }

            // Calculates the bounds of a location
            function calculateBounds(where: SpaceLocation, matrix: number[]): BoundingBox {
                var presence    = where.presence;
                var baseBounds: BoundingBox;

                // If there's a shape, we need to incorporate the shape bounds as well
                if (presence.shape) {
                    if (!presence.bounds) {
                        presence.bounds = presence.shape.getBoundingBox();
                    }

                    // Use the shape bounds instead of the tile bounds
                    // This assumes the shape includes all pixels of the sprite
                    baseBounds = presence.bounds;
                } else {
                    // Bounding box is defined by the sprite tile (required for rendering)
                    var tile = where.tile;
                    if (!tile.bounds) {
                        tile.bounds = quadBoundingBox(tile.quad);
                    }

                    baseBounds = tile.bounds;
                }

                // Result is the bounding box transformed by the matrix
                return transformBoundingBox(baseBounds, matrix);
            }

            // Creates the prototype space ref for either the spaces or the objects
            function createRefPrototype<TRefObjType>(storage: SimpleSpaceObject<TRefObjType>[]): SimpleSpaceObject<TRefObjType> {
                var refPrototype = {
                    removeObject: function() {
                        var index = 0;
                        if (storage.some((obj, objIndex) => {
                                if (obj.id === this.id) {
                                    index = objIndex;
                                    return true;
                                } else {
                                    return false;
                                }
                            })) {
                            storage.splice(index, 1);
                        }
                    },

                    move: function (where: SpaceLocation) {
                        this.matrix     = calculateMatrix(where);
                        var newBounds   = calculateBounds(where, this.matrix);

                        // Just set the bounding box
                        this.bounds = newBounds;

                        // Objects are no longer known to be sorted
                        sorted = false;

                        return this;
                    },

                    tileChanged: function (where: SpaceLocation) {
                        return this;
                    },

                    presenceChanged: function (where: SpaceLocation) {
                        return this;
                    }
                };

                return <SimpleSpaceObject<TRefObjType>> refPrototype;
            }

            // Create the prototypes for the two kinds of things that can go in here
            var objectRefPrototype  = createRefPrototype<TObject>(objects);
            var spaceRefPrototype   = createRefPrototype<Space<TObject>>(spaces);

            // Generates an object adder function for the specified 
            function createObjectAdder<TRefObjType>(storage: SimpleSpaceObject<TRefObjType>[], prototype: SimpleSpaceObject<TRefObjType>, addToSpace: (space: Space<TObject>, obj: TRefObjType, where: SpaceLocation) => void) {
                return (obj: TRefObjType, where: SpaceLocation): SpaceRef<TRefObjType> => {
                    var matrix      = calculateMatrix(where);
                    var newBounds   = calculateBounds(where, matrix);
                    var targetSpace: SimpleSpaceObject<Space<TObject>> = null;

                    // Add to this object if this doesn't fit within a contained space
                    var newRef: SimpleSpaceObject<TRefObjType> = Object.create(prototype);

                    newRef.id       = nextId;
                    newRef.obj      = obj;
                    newRef.bounds   = newBounds;
                    newRef.matrix   = matrix;

                    sorted = false;

                    storage.push(newRef);
                    nextId++;
                    return newRef;
                };
            }

            // Orders objects along the X-axis
            function orderXAxis<TRefObjType>(a: SimpleSpaceObject<TRefObjType>, b: SimpleSpaceObject<TRefObjType>) {
                if (a.bounds.x > b.bounds.x) {
                    return 1;
                } else if (a.bounds.x < b.bounds.x) {
                    return -1;
                } else {
                    return 0;
                }
            }

            // Sorts objects along the x-axis
            // (Efficient provided objects do not move a lot between frames and do not commonly cluster on the X-axis)
            function sortObjects<TRefObjType>(objs: SimpleSpaceObject<TRefObjType>[]) {
                insertionSort(objs, orderXAxis);
            }

            // Iterates over all the objects in this space and all the objects in any contained spaces
            function forAllInBounds(bounds: BoundingBox, callback: (ref: SpaceRef<TObject>) => void) {
                // Sort the objects along the X-axis
                if (!sorted) {
                    sortObjects(objects);
                    sortObjects(spaces);
                    sorted = true;
                }

                var minX = bounds.x;
                var maxX = bounds.x + bounds.width;
                var pos: number;

                // Add all of the objects that overlap this bounding box in this space
                pos = binarySearch(objects, <SimpleSpaceObject<TObject>> { bounds: { x: maxX } }, orderXAxis)-1;        // First object positioned after end of the bounds
                for (; pos>=0; --pos) {                                                                                 // Have to iterate back to the beginning as we can't exclude any objects before the initial point with just one array
                    var candidate = objects[pos];

                    if (bbOverlaps(bounds, candidate.bounds)) {
                        callback(candidate);
                    }
                }

                // Also iterate over any child spaces that overlap this bounding box
                spaces.forEach((candidate) => {
                    if (bbOverlaps(bounds, candidate.bounds)) {
                        // Include any object that's in an overlapping space
                        candidate.obj.forAllInBounds(bounds, callback);
                    }
                });
            }

            // Finds all the collision pairs in this object
            function findCollisionPairs(left: SpaceRef<TObject>[], right: SpaceRef<TObject>[]): void {
                // This is a basic sort-and-sweep algorithm, based along the X-axis
                // Note that it will be inefficient if substantial numbers of objects are clustered this way

                // Sort the objects along the X-axis (will be fast provided the array is substantially in order)
                if (!sorted) {
                    sortObjects(objects);
                    sortObjects(spaces);
                    sorted = true;
                }

                // Find collision pairs by searching the object list
                var leftIndex: number;
                var numObjects = objects.length;
                for (leftIndex = 0; leftIndex < numObjects; ++leftIndex) {
                    // Search for colliding objects that are to the right of this one
                    // Objects to the left have already been checked by previous iterations of this loop
                    var leftObj     = objects[leftIndex];
                    var leftBounds  = leftObj.bounds;

                    // We'll stop once we find an object with a min x position (which the array is sorted by) beyond the end of this object
                    // (At this point, no further objects can overlap)
                    var maxX    = leftBounds.x + leftBounds.width;

                    for (var rightIndex = leftIndex + 1; rightIndex < numObjects; ++rightIndex) {
                        var rightObj    = objects[rightIndex];
                        var rightBounds = rightObj.bounds;

                        // If this object starts after the end of the current object, then it can't be in collision and neither can any object further to the right
                        if (rightBounds.x > maxX) {
                            break;
                        }

                        // Check for collision and add to the arrays if it exists
                        if (bbOverlaps(leftBounds, rightBounds)) {
                            left.push(leftObj);
                            right.push(rightObj);
                        }
                    }
                }

                // Look for collisions in any subspaces
                spaces.forEach((collisionSpace) => collisionSpace.obj.findCollisionPairs(left, right));
            }

            // Genereate the functions for this object
            this.addObject          = createObjectAdder(objects, objectRefPrototype, function (space, obj, bounds) { space.addObject(obj, bounds); });
            this.addSpace           = createObjectAdder(spaces, spaceRefPrototype, function (space, obj, bounds) { space.addSpace(obj, bounds); });
            this.forAllInBounds     = forAllInBounds;
            this.findCollisionPairs = findCollisionPairs;
        }

        /** Adds an object to this space, or to a contained space if it is contained by it */
        addObject: (obj: TObject, where: SpaceLocation) => SpaceRef<TObject>;

        /** Adds a space to this space */
        addSpace: (obj: Space<TObject>, where: SpaceLocation) => SpaceRef<Space<TObject>>;

        /** Performs a callback on all objects that overlap the specified bounding box */
        forAllInBounds: (bounds: BoundingBox, callback: (ref: SpaceRef<TObject>) => void) => void;

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
         */
        findCollisionPairs: (left: SpaceRef<TObject>[], right: SpaceRef<TObject>[]) => void;
    }
}
