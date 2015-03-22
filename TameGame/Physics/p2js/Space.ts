/// <reference path="../Physics.ts" />

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

            // Updates the shape for a body
            function updateShape(body: p2.Body, shape: Shape) {
                // Delete the old shape
                if (body.shapes) {
                    body.shapes.forEach((oldShape) => body.removeShape(oldShape));
                }

                // Nothing to do if no shape was passed in
                if (!shape) {
                    return;
                }

                // Replay the new shape into this one
                shape.replay({
                    unknownShape: () => {},
                    polygon: (vertices) => {
                        var p2vertices = vertices.map((vertex) => [ vertex.x, vertex.y ]);
                        var convex = new p2.Convex(p2vertices);
                        body.addShape(convex, [ 0, 0 ], 0);
                    },
                    circle: (center, radius) => {
                        var circle = new p2.Circle(radius);
                        body.addShape(circle, [ center.x, center.y ], 0);
                    }
                });
            }

            // Updates a p2 body's location from a location
            function updateLocation(body: p2.Body, where: SpaceLocation) {
                // Get the location and presence
                var location = where.location;
                var presence = where.presence;

                // Update the p2body
                var pos = location.pos;
                body.position[0]    = pos.x;
                body.position[1]    = pos.y;
                body.angle          = location.angle;
            }

            // Creates a p2 body from a location
            function createBody(where: SpaceLocation): p2.Body {
                // Create a new body and return it
                var result = new p2.Body();

                result.type = result.DYNAMIC;
                result.mass = 10;

                updateShape(result, where.presence.shape);
                updateLocation(result, where);
                return result;
            }

            // Gets the bounding box of a p2.js body
            function getBounds(body: p2.Body): BoundingBox {
                var aabb    = body.getAABB();
                var bounds  = { x: aabb.lowerBound[0], y: aabb.lowerBound[1], width: aabb.upperBound[0]-aabb.lowerBound[0], height: aabb.upperBound[1]-aabb.lowerBound[1] };
                return bounds;
            }

            // Gets the matrix for a p2 body
            function getMatrix(body: p2.Body): number[] {
                if (body.interpolatedPosition && false) {
                    return rotateTranslateMatrix(body.interpolatedAngle, { x: body.interpolatedPosition[0], y: body.interpolatedPosition[1] });
                } else {
                    return rotateTranslateMatrix(body.angle, { x: body.position[0], y: body.position[1] });
                }
            }

            // Advances the world by a tick
            var lastTime = 0;
            function firstTick(time: number): void {
                // Advance the world by 1/60th of a second on the first tick
                lastTime = time;
                world.step(1/60, 0);

                postTick();

                // Use the lastTime for future ticks
                this.tick = nextTick;
            }

            function nextTick(time: number): void {
                world.step(1/60, (lastTime - time)/1000.0);
                lastTime = time;

                postTick();
            }

            function postTick(): void {
                // Update the bounds/matrix for everything in the space
                world.bodies.forEach(body => {
                    var spaceRef: P2SpaceRef<TObject> = body['spaceRef'];

                    if (spaceRef) {
                        spaceRef.bounds = getBounds(body);
                        spaceRef.matrix = getMatrix(body);
                    }
                });
            }

            // Adds an object to this space
            function addObject(obj: TObject, where: SpaceLocation): P2SpaceRef<TObject> {
                // Create the body
                var body = createBody(where);
                world.addBody(body);

                // Get the bounds
                var bounds = getBounds(body);
                var matrix = getMatrix(body);

                // Create the ref for this body
                var spaceRef: P2SpaceRef<TObject> = {
                    removeObject: function() {
                        world.removeBody(body);
                    },

                    move: function (where: SpaceLocation): P2SpaceRef<TObject> {
                        updateLocation(body, where);
                        this.bounds = getBounds(body);
                        this.matrix = getMatrix(body);
                        return this;
                    },

                    bounds: bounds,
                    matrix: matrix,
                    obj: obj,
                    p2Body: body
                };

                // Store the ref in the body (typescript won't let us extend the class to contain this property, so do it without typing)
                body['spaceRef'] = spaceRef;

                return spaceRef;
            }

            // Finds all of the objects in a certain bounding box
            function forAllInBounds(bounds: BoundingBox, callback: (ref: SpaceRef<TObject>) => void): void {
                // Fairly simple matter of trying out each body in turn
                world.bodies.forEach(body => {
                    var spaceRef: P2SpaceRef<TObject> = body['spaceRef'];
                    if (spaceRef && bbOverlaps(spaceRef.bounds, bounds)) {
                        callback(spaceRef);
                    }
                });
            }

            // Finds all of the collision pairs in this space
            function findCollisionPairs(left: SpaceRef<TObject>[], right: SpaceRef<TObject>[]): void {
                // Use p2js's OverlapKeeper to find anything that's in collision
                var overlapping = world.overlapKeeper.overlappingShapesCurrentState;

                overlapping.keys.forEach(key => {
                    var overlap = overlapping.data[key];

                    var leftRef: P2SpaceRef<TObject> = overlap.bodyA['spaceRef'];
                    var rightRef: P2SpaceRef<TObject> = overlap.bodyB['spaceRef'];

                    if (leftRef && rightRef) {
                        left.push(leftRef);
                        right.push(rightRef);
                    }
                });
            }

            // Store the function definitions
            this.addObject          = addObject;
            this.addSpace           = null;
            this.forAllInBounds     = forAllInBounds;
            this.findCollisionPairs = findCollisionPairs;
            this.world              = world;
            this.tick               = firstTick;
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

        /**
         * Performs a physics tick at the specified time
         */
        tick: (time: number) => void;
    }
}
