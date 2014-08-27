/// <reference path="../RenderQueue/RenderTypes.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    // Default maximum number of objects per quad
    var defaultMaxObjects = 4;
    
    /**
     * Data stored for an object in the quadtree
     */
    interface QuadObject {
        /** The partition where this object is located */
        location: Partition;
        
        /** Bounding box of this object */
        bounds: BoundingBox;
        
        /** The object that exists within this bounding box */
        obj: any;
    }
    
    /**
     * Class representing a quad tree partition
     */
    class Partition {
        /** Creates a partition mapping a particular region */
        constructor(region: BoundingBox, parent?: Partition, northEastChild?: Partition) {
            var that = this;
            var ne, nw, se, sw: Partition;
            var halfWidth   = region.width / 2.0;
            var halfHeight  = region.height / 2.0;
            
            if (!parent) {
                parent = null;
            }
            
            // After converting to a non-leaf node, distributes the objects in this object to the child objects
            function distributeObjects() {
                // Get the objects to distribute and remove from this object
                var objects = that.objects;
                
                // Clear the list of objects
                this.objects = [];
                
                // Distribute each of the objects in turn
                objects.forEach((obj) => { this.placeObject(obj) });
            }
            
            // Gives this partition non-leaf behavior
            function nonLeafBehavior() {
                // Non-leafnode (ne,nw,se,sw all populated) behaviour for forAllOverlapping
                this.forAllOverlapping = (targetRegion, callback) => {
                    // Recurse if the target region overlaps this object
                    if (bbOverlaps(region, targetRegion)) {
                        callback(this);
                        
                        // Search the child regions as well
                        ne.forAllOverlapping(targetRegion, callback);
                        nw.forAllOverlapping(targetRegion, callback);
                        se.forAllOverlapping(targetRegion, callback);
                        sw.forAllOverlapping(targetRegion, callback);
                    }
                };
                
                // Distribute an object to the child regions
                this.placeObject = (quadObject) => {
                    var partition: Partition = this;
                    var objBounds = quadObject.bounds;
                    
                    // If one of the child quads can contain the object then place it there
                    var placed = [ ne, nw, se, sw ].some((child) => {
                        if (bbContains(child.bounds, objBounds)) {
                            partition = child;
                            child.placeObject(quadObject);
                            return true;
                        } else {
                            return false;
                        }
                    });
                    
                    // If none of the child objects could contain this object, place it in this quad
                    if (!placed) {
                        this.objects.push(quadObject);
                    }
                    
                    quadObject.location = partition;
                    return partition;
                }
            }
            
            // Set up the properties for this item
            this.objects = [];
            this.bounds = region;
            
            // Leafnode behaviour for forAllOverlapping
            this.forAllOverlapping = (targetRegion, callback) => {
                // Pretty simple: callback if the region overlaps the target region
                if (bbOverlaps(region, targetRegion)) {
                    callback(this);
                }
            };
            
            // Leafnode behaviour for placeObject
            this.placeObject = (quadObject) => {
                // Just add the object to this quad (assume that the caller checked that it's inside)
                this.objects.push(quadObject);
                quadObject.location = this;
                
                return this;
            }
            
            // Create the functions for this partition
            this.subdivide = () => {
                // Divide this partition in four
                ne = new Partition({ x: region.x,           y: region.y,            width: halfWidth, height: halfHeight }, this);
                nw = new Partition({ x: region.x+halfWidth, y: region.y,            width: halfWidth, height: halfHeight }, this);
                se = new Partition({ x: region.x,           y: region.y+halfHeight, width: halfWidth, height: halfHeight }, this);
                sw = new Partition({ x: region.x+halfWidth, y: region.y+halfHeight, width: halfWidth, height: halfHeight }, this);
                
                // Subdivide is a no-op after the first time
                this.subdivide = () => {};
                
                // We're not a leaf-node any more
                nonLeafBehavior();
                distributeObjects();
            };
            
            if (!parent) {
                // Expand this partition
                this.createParent = () => {
                    // Create a new parent, with this partition in the north-east corner
                    parent = new Partition({ x: region.x, y: region.y, width: region.width*2, height: region.height*2 }, null, this);
                    
                    // createParent is a no-op after the first time
                    this.createParent = () => parent;
                    return parent;
                };
            } else {
                // Parent already exists: we don't recreate it
                this.createParent = () => parent;
            }
            
            // If a north-east child is supplied then populate the subdivisions
            if (northEastChild) {
                ne = northEastChild;
                nw = new Partition({ x: region.x+halfWidth, y: region.y,            width: halfWidth, height: halfHeight }, this);
                se = new Partition({ x: region.x,           y: region.y+halfHeight, width: halfWidth, height: halfHeight }, this);
                sw = new Partition({ x: region.x+halfWidth, y: region.y+halfHeight, width: halfWidth, height: halfHeight }, this);

                // Switch to non-leaf behaviour
                this.subdivide = () => {};
                nonLeafBehavior();
                distributeObjects();
            }
        }
        
        /** Subdivides this partition into 4 other partitions */
        subdivide: () => void;
        
        /** Creates a parent partition */
        createParent: () => Partition;
        
        /** Calls an iterator to find all the leaf partitions that overlap a particular bounding box */
        forAllOverlapping: (region: BoundingBox, callback: (partition: Partition) => void) => void;
        
        /** Places an object in this partition: it must lie within the partion's bounds. Returns the smallest partition that contains the object. */
        placeObject: (QuadObject) => Partition;
        
        /** The bounds of this partition */
        bounds: BoundingBox;
        
        /** The objects in this partition (unset for items with child nodes) */
        objects: QuadObject[];
    }
    
    /**
     * References an object in the quadtree
     */
    export class QuadTreeReference {
        // The quadObject that this reference represents
        quadObject: any;
    };
    
    /**
     * A quadtree is a way of representing items in space.
     *
     * Its main use is finding objects that are on-camera as well as finding objects that are potentially
     * in collision.
     */
    export class QuadTree {
        private _mainPartition: Partition;
        
        constructor(maxObjects?: number) {
            // Set the maximum number of objects in this item
            if (!maxObjects || maxObjects <= 0) {
                maxObjects = defaultMaxObjects;
            }
            
            // The initial partition covers the region from -1,-1 to 1,1
            this._mainPartition = new Partition({ x:-1, y:-1, width:2, height: 2});
            
            this.addObject = (bounds, obj) => {
                // Create a quadObj
                var quadObj: QuadObject = { bounds: bounds, obj: obj, location: null };
                
                // Expand the main partition if necessary
                while (!bbContains(this._mainPartition.bounds, bounds)) {
                    this._mainPartition = this._mainPartition.createParent();
                }
                
                // Add the object to the main partition
                var objectPartition = this._mainPartition.placeObject(quadObj);
                
                // Split the partition if there are too many objects in it
                if (objectPartition.objects.length > maxObjects) {
                    objectPartition.subdivide();
                }
                
                return { quadObject: quadObj };
            };
            
            this.removeObject = (reference) => {
                if (!reference || !reference.quadObject.location) {
                    return;
                }
                
                // Retrieve the quadObject data structure (fixes the type)
                var quadObj: QuadObject = reference.quadObject;
                
                // Remove this obejct from its partition
                var index = quadObj.location.objects.indexOf(quadObj);
                quadObj.location.objects.splice(index, 1);
                
                // Indicate that it's partitionless now
                quadObj.location = null;
            };

            this.forAllInBounds = (bounds, callback) => {
                this._mainPartition.forAllOverlapping(bounds, (partition) => {
                    partition.objects.forEach((quadObj) => {
                        if (bbOverlaps(bounds, quadObj.bounds)) {
                            callback(quadObj.obj, bounds, { quadObject: quadObj });
                        }
                    });
                });
            };
        }
        
        /** Places an object in this QuadTree */
        addObject: (bounds: BoundingBox, obj: any) => QuadTreeReference;
        
        /** Removes an existing object */
        removeObject: (reference: QuadTreeReference) => void;
        
        /** Perform an action for all objects in a particular bounding box */
        forAllInBounds: (bounds: BoundingBox, callback: (obj: any, bounds: BoundingBox, reference: QuadTreeReference) => void) => void;
    }
}
