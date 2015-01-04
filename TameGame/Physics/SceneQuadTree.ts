/// <reference path="../Core/Core.ts" />
/// <reference path="../Sprite/Sprite.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="QuadTree.ts" />
/// <reference path="SetObjectTransform.ts" />

module TameGame {
    export interface Scene {
        /** QuadTree of objects in this scene (not defined if quad tree behaviour is turned off) */
        quadTree?: QuadTree;

        /** List of objects that have moved since the last time the quadtree was updated */
        movedObjects?: { [id: number]: TameObject };
    }
    
    export interface TameObject {
        /** Most recently calculated axis-aligned bounding box */
        aabb?: BoundingBox;
        
        /** Where this object is located in the scene quadtree */
        quadTreeRef?: QuadTreeReference;
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
    
    /** Attaches scene quadtree tracking behaviour to an existing game */
    export function sceneQuadTreeBehavior(game: Game) {
        // Function to update the aabb of an object
        var updateObjectBounds = (obj: TameObject) => {
            obj.aabb = obj.behavior.aabb.calculateBounds(obj);
        };

        // Function to remove an object, update its AABB and then put it back in its scene
        var updateAndMoveObject = (obj: TameObject, quadTree: QuadTree) => {
            if (obj.quadTreeRef) {
                quadTree.removeObject(obj.quadTreeRef);
            }

            obj.aabb = obj.behavior.aabb.calculateBounds(obj);

            obj.quadTreeRef = quadTree.addObject(obj.aabb, obj);
        };

        // Marks an object as having been moved since the quadtree was updated
        var markAsMoved = (obj: TameObject) => {
            var scene = obj.scene;
            if (scene) {
                scene.movedObjects[obj.identifier] = obj;
            }
        }

        game.events.onCreateScene((scene) => {
            // Create a QuadTree for this scene
            var quadTree = new QuadTree();
            scene.quadTree      = quadTree;
            scene.movedObjects  = {};
            
            // When objects are added or removed from the scene, add or remove thenm from the appropriate quadTree
            scene.events.onAddObject((obj) => {
                // Update the bounds of the object
                updateObjectBounds(obj);
                
                // Add to the quadtree for this scene
                obj.quadTreeRef = scene.quadTree.addObject(obj.aabb, obj);
            });
            
            scene.events.onRemoveObject((obj) => {
                if (obj.quadTreeRef) {
                    scene.quadTree.removeObject(obj.quadTreeRef);
                    delete obj.quadTreeRef;
                }

                delete scene.movedObjects[obj.identifier];
            });

            // When the quadtree is queried, make sure all of the moved objects are in fact moved
            var updateMovedObjects = () => {
                var objId;
                var movedObjects = scene.movedObjects;

                for (objId in movedObjects) {
                    updateAndMoveObject(movedObjects[objId], quadTree);
                }

                scene.movedObjects = {};
            };

            quadTree.onUpdate(updateMovedObjects);
        });
        
        game.watch(Position, UpdatePass.Immediate, markAsMoved, Priority.UseDerivedValues);
        game.watch(Presence, UpdatePass.Immediate, markAsMoved, Priority.UseDerivedValues);
    }
}
