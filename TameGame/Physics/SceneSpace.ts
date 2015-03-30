/// <reference path="../Core/Core.ts" />
/// <reference path="../Sprite/Sprite.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="Space.ts" />
/// <reference path="Simple/SimpleSpace.ts" />
/// <reference path="SetObjectTransform.ts" />

module TameGame {
    "use strict";

    export interface Scene {
        /** Space containing the objects in this scene */
        space?: Space<TameObject>;

        /** Set to true if the objects in this scene need to be re-added to the space */
        spaceChanged?: boolean;

        /** Makes sure that all of the objects in the scene are up to date */
        updateMovedObjects?: () => void;
    }
    
    export interface TameObject {
        /** Where this object is located in the scene space */
        spaceRef?: SpaceRef<TameObject>;
    }
    
    /** Attaches scene space tracking behaviour to an existing game */
    export function sceneSpaceBehavior(game: Game) {
        // Function to remove an object, update its AABB and then put it back in its scene
        var updateAndMoveObject = (obj: TameObject, space: Space<TameObject>) => {
            if (obj.spaceRef) {
                obj.spaceRef = obj.spaceRef.move(obj);
            } else {
                obj.spaceRef = space.addObject(obj, obj);
            }
        };

        // Marks an object as having been moved since the space was updated
        var clearAABB = (obj: TameObject) => {
            obj['_aabb'] = null;
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

        defineUninitializedField(game.scenePrototype, 'space', (obj, defineProperty) => {
            var theSpace: Space<TameObject> = null;

            // Whenever the Space field is updated, set the 'spaceChanged' flag
            defineProperty({
                enumerable: true,
                configurable: true,
                get: () => theSpace,
                set: function (val) {
                    theSpace = val;
                    this.spaceChanged = true;
                }
            });

            return theSpace;
        });

        game.events.onCreateScene((scene) => {
            // Create a space for this scene
            scene.space         = new SimpleSpace<TameObject>();
            scene.spaceChanged  = false;
            
            // When objects are added or removed from the scene, add or remove them from the appropriate space
            scene.events.onAddObject((obj) => {
                // Add to the space for this scene
                obj.spaceRef = scene.space.addObject(obj, obj);
            });
            
            scene.events.onRemoveObject((obj) => {
                if (obj.spaceRef) {
                    obj.spaceRef.removeObject();
                    obj.spaceRef = null;
                }
            });

            // Add a way to make sure that all of the objects are updated in a scene
            var updateMovedObjects = () => {
                var objId;
                var space = scene.space;

                if (scene.spaceChanged && space) {
                    // Re-add all of the objects to the current space
                    scene.forAllObjects((obj) => {
                        // Remove from any space this object is already in
                        if (obj.spaceRef) {
                            obj.spaceRef.removeObject();
                            obj.spaceRef = null;
                        }

                        // Add to the new space
                        obj.spaceRef = space.addObject(obj, obj);
                    });

                    // Space is up to date, don't need to do any more work
                    scene.spaceChanged = false;
                }

                // Get the changed objects from the scene
                var tiled       = scene.changesForProperty('tile');
                var reshaped    = scene.changesForProperty('presence');
                var moved       = scene.changesForProperty('location');

                tiled.forEach(obj => updateAndMoveObject(obj, space));
                reshaped.forEach(obj => updateAndMoveObject(obj, space));
                moved.forEach(obj => updateAndMoveObject(obj, space));
            };

            scene.updateMovedObjects = updateMovedObjects;
        });
        
        game.watch(Tile, UpdatePass.Immediate, clearAABB, Priority.UseDerivedValues);
        game.watch(Presence, UpdatePass.Immediate, clearAABB, Priority.UseDerivedValues);
        game.watch(Location, UpdatePass.Immediate, clearAABB, Priority.UseDerivedValues);
    }
}
