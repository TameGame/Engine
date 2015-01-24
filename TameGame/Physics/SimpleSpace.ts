/// <reference path="Space.ts" />
/// <reference path="../Algorithms/Algorithms.ts" />

module TameGame {
    "use strict";

    interface SimpleSpaceObject<TObject> extends SpaceRef<TObject> {
        id: number;
    }

   /**
     * Basic space class that does not perform any explicit subdivision
     */
    export class SimpleSpace<TObject> implements Space<TObject> {
        constructor(parent?: Space<TObject>, bounds?: BoundingBox) {
            var nextId: number                              = 0;
            var objects: SimpleSpaceObject<TObject>[]       = [];
            var spaces: SimpleSpaceObject<Space<TObject>>[] = [];
            var sorted: boolean                             = true;

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

                    move: function (newBounds: BoundingBox) {
                        // Just set the bounding box
                        this.bounds = newBounds;

                        // Objects are no longer known to be sorted
                        sorted = false;

                        return this;
                    }
                };

                // Move should move the object into the parent if we have a bounding box and it's outside
                if (parent && bounds) {
                    refPrototype.move = function (newBounds: BoundingBox) {
                        sorted = false;

                        if (!bbContains(bounds, newBounds)) {
                            // Move into the parent
                            this.removeObject();
                            return parent.addObject(this.obj, newBounds);
                        } else {
                            // Store in this object
                            this.bounds = newBounds;
                            return this;
                        }
                    }
                }

                return <SimpleSpaceObject<TRefObjType>> refPrototype;
            }

            // Create the prototypes for the two kinds of things that can go in here
            var objectRefPrototype  = createRefPrototype<TObject>(objects);
            var spaceRefPrototype   = createRefPrototype<Space<TObject>>(spaces);

            // Generates an object adder function for the specified 
            function createObjectAdder<TRefObjType>(storage: SimpleSpaceObject<TRefObjType>[], prototype: SimpleSpaceObject<TRefObjType>, addToSpace: (space: Space<TObject>, obj: TRefObjType, newBounds: BoundingBox) => void) {
                return (obj: TRefObjType, newBounds: BoundingBox): SpaceRef<TRefObjType> => {
                    var targetSpace: SimpleSpaceObject<Space<TObject>> = null;

                    // Try to add to a space contained within this object
                    if (spaces.some(candidateSpace => {
                        if (bbContains(candidateSpace.bounds, newBounds)) {
                            targetSpace = candidateSpace;
                            return true;
                        } else {
                            return false;
                        }
                    })) {
                        // Add to the contained target space
                        addToSpace(targetSpace.obj, obj, newBounds);
                    } else {
                        // Add to this object if this doesn't fit within a contained space
                        var newRef: SimpleSpaceObject<TRefObjType> = Object.create(prototype);

                        newRef.id       = nextId;
                        newRef.obj      = obj;
                        newRef.bounds   = newBounds;

                        sorted = false;

                        storage.push(newRef);
                        nextId++;
                        return newRef;
                    }
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
                pos = binarySearch(objects, <SimpleSpaceObject<TObject>> { bounds: { x: maxX } }, orderXAxis)-1;          // First object positioned after end of the bounds
                for (; pos>=0; --pos) {
                    var candidate = objects[pos];

                    if (bbOverlaps(bounds, candidate.bounds)) {
                        callback(candidate);
                    } else if (candidate.bounds.x+candidate.bounds.width < minX) {
                        //break;
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

            // Genereate the functions for this object
            this.addObject      = createObjectAdder(objects, objectRefPrototype, function (space, obj, bounds) { space.addObject(obj, bounds); });
            this.addSpace       = createObjectAdder(spaces, spaceRefPrototype, function (space, obj, bounds) { space.addSpace(obj, bounds); });
            this.forAllInBounds = forAllInBounds;
        }

        /** Adds an object to this space, or to a contained space if it is contained by it */
        addObject: (obj: TObject, bounds: BoundingBox) => SpaceRef<TObject>;

        /** Adds a space to this space */
        addSpace: (obj: Space<TObject>, bounds: BoundingBox) => SpaceRef<Space<TObject>>;

        /** Performs a callback on all objects that overlap the specified bounding box */
        forAllInBounds: (bounds: BoundingBox, callback: (ref: SpaceRef<TObject>) => void) => void;
    }
}
