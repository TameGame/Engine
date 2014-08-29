/// <reference path="../Core/Core.ts" />
/// <reference path="../Sprite/Sprite.ts" />
/// <reference path="BasicProperties.ts" />
/// <reference path="QuadTree.ts" />

module TameGame {
    export interface Scene {
        /** QuadTree of objects in this scene (not defined if quad tree behaviour is turned off) */
        quadTree?: QuadTree;
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
    
    /**
     * Type definition for object render behaviour
     */
    export var AabbBehavior: TypeDefinition<IAabbBehavior> = {
        name: createTypeName(),
        createDefault() {
            return { 
                calculateBounds: (obj) => {
                    var pos         = obj.get(Position);
                    var presence    = obj.get(Presence);
                    var quad: Quad  = pos;
                    
                    // If there's a shape, use the shape to get the quad instead
                    if (presence.shape) {
                        var shapeBounds = presence.shape.getBoundingBox();
                        quad = bbToQuad(shapeBounds);
                    }
                    
                    // Transform according to the presence settings
                    if (presence) {
                        var presenceTransform   = multiplyMatrix(translateMatrix(presence.location), rotationMatrix(presence.rotation));
                        quad = transformQuad(presenceTransform, quad);
                    }
                    
                    // Convert to a bounding box and return
                    return quadBoundingBox(quad);
                }
            };
        }
    };
    
    /** Attaches scene quadtree tracking behaviour to an existing game */
    export function sceneQuadTreeBehavior(game: Game) {
        // Function to update the aabb of an object
        var updateObjectBounds = (obj: TameObject) => {
            obj.aabb = obj.getBehavior(AabbBehavior).calculateBounds(obj);
        };

        // Function to remove an object, update its AABB and then put it back in its scene
        var updateAndMoveObject = (obj: TameObject) => {
            var scene = obj.scene;
            if (!scene) return;
            
            if (obj.quadTreeRef) {
                scene.quadTree.removeObject(obj.quadTreeRef);
            }

            updateObjectBounds(obj);

            obj.quadTreeRef = scene.quadTree.addObject(obj.aabb, obj);
        };

        game.events.onCreateScene((scene) => {
            // Create a QuadTree for this scene
            scene.quadTree = new QuadTree();
            
            // When objects are added or removed from the scene, add or remove thenm from the appropriate quadTree
            scene.events.onAddObject((obj) => {
                // Update the bounds of the object
                updateObjectBounds(obj);
                
                // Add to the quadtree for this scene
                scene.quadTree.addObject(obj.aabb, obj);
            });
            
            scene.events.onRemoveObject((obj) => {
                if (obj.quadTreeRef) {
                    scene.quadTree.removeObject(obj.quadTreeRef);
                    delete obj.quadTreeRef;
                }
            });
        });
        
        game.watch(Position, UpdatePass.Immediate, (obj) => updateAndMoveObject(obj));
        game.watch(Presence, UpdatePass.Immediate, (obj) => updateAndMoveObject(obj));
    }
}
