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
                var presence            = obj.presence;
                var transform: number[] = obj.transformationMatrix;
                var bounds: BoundingBox;

                // If there's a shape, use the shape to get the quad instead
                if (presence.shape) {
                    return presence.shape.getBoundingBox(transform);
                } else {
                    if (transform) {
                        return transformBoundingBox(quadBoundingBox(obj.tile.quad), transform);
                    } else {
                        return quadBoundingBox(obj.tile.quad);
                    }
                }
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
            obj['_aabb'] = null;
            if (scene) {
                scene.movedObjects[obj.identifier] = obj;
            }
        }

        Object.defineProperty(game.objectPrototype, 'aabb', {
            get: function () {
                if (!this['_aabb']) {
                    this['_aabb'] = this.behavior.aabb.calculateBounds(this);
                }
                return this['_aabb'];
            },
            set: function (val) {
                this['_aabb'] = val;
            }
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
        
        game.watch(Tile, UpdatePass.Immediate, markAsMoved, Priority.UseDerivedValues);
        game.watch(Presence, UpdatePass.Immediate, markAsMoved, Priority.UseDerivedValues);
    }
}
