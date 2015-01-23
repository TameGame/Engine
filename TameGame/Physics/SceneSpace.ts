/// <reference path="../Core/Core.ts" />
/// <reference path="../Sprite/Sprite.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="Space.ts" />
/// <reference path="SimpleSpace.ts" />
/// <reference path="SetObjectTransform.ts" />

module TameGame {
    "use strict";

    export interface Scene {
        /** Space containing the objects in this scene */
        space?: Space<TameObject>;

        /** List of objects that have moved since the last time the space was updated */
        movedObjects?: { [id: number]: TameObject };

        /** Makes sure that all of the objects in the scene are up to date */
        updateMovedObjects?: () => void;
    }
    
    export interface TameObject {
        /** Most recently calculated axis-aligned bounding box */
        aabb?: BoundingBox;

        /** Where this object is located in the scene space */
        spaceRef?: SpaceRef<TameObject>;
    }

    /**
     * Behavior that describes how an object calculates its axis-aligned bounding box (aka the AABB)
     */
    export interface IAabbBehavior {
        /** Calculates the axis-aligned bounding box for this object */
        calculateBounds(obj: TameObject): BoundingBox;
    }
    
    export interface Behavior {
        aabb?: IAabbBehavior;
    }
    
    /**
     * Type definition for object render behaviour
     */
    export var AabbBehavior: TypeDefinition<IAabbBehavior> = declareBehavior<IAabbBehavior>('aabb', () => {
        return { 
            calculateBounds: (obj) => {
                var pos         = obj.position;
                var presence    = obj.presence;
                var quad: Quad  = pos.quad;

                // If there's a shape, use the shape to get the quad instead
                if (presence.shape) {
                    var shapeBounds = presence.shape.getBoundingBox();
                    quad = bbToQuad(shapeBounds);
                }

                // Transform according to the presence settings
                if (obj.transformationMatrix) {
                    quad = transformQuad(obj.transformationMatrix, quad);
                }

                // Convert to a bounding box and return
                return quadBoundingBox(quad);
            }
        };
    });
    
    /** Attaches scene space tracking behaviour to an existing game */
    export function sceneSpaceBehavior(game: Game) {
        // Function to remove an object, update its AABB and then put it back in its scene
        var updateAndMoveObject = (obj: TameObject, space: Space<TameObject>) => {
            if (obj.spaceRef) {
                obj.spaceRef = obj.spaceRef.move(obj.aabb);
            } else {
                obj.spaceRef = space.addObject(obj, obj.aabb);
            }
        };

        // Marks an object as having been moved since the space was updated
        var markAsMoved = (obj: TameObject) => {
            var scene = obj.scene;
            obj['_aabb'] = true;
            if (scene) {
                scene.movedObjects[obj.identifier] = obj;
            }
        }

        game.events.onCreateObject((newObj) => {
            var aabb: BoundingBox = { x: 0, y: 0, width: 0, height: 0 };

            Object.defineProperty(newObj, 'aabb', {
                get: () => {
                        if (newObj['_aabb']) {
                            newObj['_aabb'] = false;
                            aabb = newObj.behavior.aabb.calculateBounds(newObj);
                        }
                        return aabb;
                    },
                set: (val) => {
                    aabb = val;
                    newObj['_aabb'] = false;
                }
            });
        });

        game.events.onCreateScene((scene) => {
            // Create a space for this scene
            scene.space         = new SimpleSpace<TameObject>();
            scene.movedObjects  = {};
            
            // When objects are added or removed from the scene, add or remove them from the appropriate space
            scene.events.onAddObject((obj) => {
                // Add to the space for this scene
                obj.spaceRef = scene.space.addObject(obj, obj.aabb);
            });
            
            scene.events.onRemoveObject((obj) => {
                if (obj.spaceRef) {
                    obj.spaceRef.removeObject();
                    delete obj.spaceRef;
                }

                delete scene.movedObjects[obj.identifier];
            });

            // When the space is queried, make sure all of the moved objects are in fact moved
            var updateMovedObjects = () => {
                var objId;
                var movedObjects = scene.movedObjects;
                var space = scene.space;

                for (objId in movedObjects) {
                    updateAndMoveObject(movedObjects[objId], space);
                }

                scene.movedObjects = {};
            };

            scene.updateMovedObjects = updateMovedObjects;
        });
        
        game.watch(Position, UpdatePass.Immediate, markAsMoved, Priority.UseDerivedValues);
        game.watch(Presence, UpdatePass.Immediate, markAsMoved, Priority.UseDerivedValues);
    }
}
