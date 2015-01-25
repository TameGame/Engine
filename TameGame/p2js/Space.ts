/// <reference path="../Physics/Physics.ts" />

module TameGame {
    "use strict";

    /**
     * Reference to an object stored in a P2Space 
     */
    export interface P2SpaceRef<TObject> extends SpaceRef<TObject> {
        /** The representation of this object in P2 */
        p2Body: p2.Body;

        /** Moves this object to a new location within the current space (or via its parent space). Returns a new reference to the moved object */
        move(where: SpaceLocation): P2SpaceRef<TObject>;
    }

    /**
     * Implements a space that is implemented by a p2js world
     */
    export class P2Space<TObject> implements Space<TObject> {
        constructor() {
            // Create the world
            var world = new p2.World();

            // Updates a p2 body's location from a location
            function updateLocation(body: p2.Body, where: SpaceLocation) {
                // Get the locaiton and presence
                var location = where.location;
                var presence = where.presence;

                // Update the p2body
                // TODO: also the shape
                var pos = location.pos;
                body.position[0]    = pos.x;
                body.position[1]    = pos.y;
                body.angle          = location.angle;
            }

            // Creates a p2 body from a location
            function createBody(where: SpaceLocation): p2.Body {
                // Create a new body and return it
                var result = new p2.Body();
                updateLocation(result, where);
                return result;
            }

            // Adds an object to this space
            function addObject(obj: TObject, where: SpaceLocation): P2SpaceRef<TObject> {
                // Create the body
                var body = createBody(where);
                world.addBody(body);

                // Create the ref for this body
                var spaceRef: P2SpaceRef<TObject> = {
                    removeObject: function() {
                        world.removeBody(body);
                    },

                    move: function (where: SpaceLocation): P2SpaceRef<TObject> {
                        updateLocation(body, where);
                        return this;
                    },

                    bounds: null,           // TODO: get from the AABB
                    matrix: null,           // TODO: calculate from the values in the body
                    obj: obj,
                    p2Body: body
                };

                // Store the ref in the body (typescript won't let us extend the class to contain this property, so do it without typing)
                body['spaceRef'] = spaceRef;

                return spaceRef;
            }

            // Store the function definitions
            this.addObject          = addObject;
            this.addSpace           = null;
            this.forAllInBounds     = null;
            this.findCollisionPairs = null;
            this.world              = world;
        }

        /** Adds an object to this space, or to a contained space if it is contained by it */
        addObject: (obj: TObject, where: SpaceLocation) => P2SpaceRef<TObject>;

        /** 
         * Adds a subspace to this space 
         *
         * Subspaces are searched when performing collision detection and when searching for objects inside
         * a particular bounding box. Objects are not added or moved to a subspace.
         */
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
         *
         * If two subspaces overlap and contain colliding objects then this call will not generate collision
         * pairs for them.
         */
        findCollisionPairs: (left: SpaceRef<TObject>[], right: SpaceRef<TObject>[]) => void;

        /**
         * The P2 world that this space represents
         */
        world: p2.World;
    }
}
