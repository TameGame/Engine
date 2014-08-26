/// <reference path="../RenderQueue/RenderTypes.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    /**
     * Data stored for an object in the quadtree
     */
    interface QuadObject {
        /** Identifier of this object */
        id: number;
        
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
            var ne, nw, se, sw: Partition;
            var halfWidth   = region.width / 2.0;
            var halfHeight  = region.height / 2.0;
            
            if (!parent) {
                parent = null;
            }
            
            // After converting to a non-leaf node, distributes the objects in this object to the child objects
            function distributeObjects() {
                // Get the objects to distribute and remove from this object
                var objects = this.objects;
                delete this.objects;
                
                // Distribute each of the objects in turn
                objects.forEach((obj) => this.placeObject(obj));
            }
            
            // Gives this partition non-leaf behavior
            function nonLeafBehavior() {
                // Non-leafnode (ne,nw,se,sw all populated) behaviour for forAllOverlapping
                this.forAllOverlapping = (targetRegion, callback) => {
                    // Recurse if the target region overlaps this object
                    if (bbOverlaps(region, targetRegion)) {
                        // Search the child regions as well
                        ne.forAllOverlapping(targetRegion, callback);
                        nw.forAllOverlapping(targetRegion, callback);
                        se.forAllOverlapping(targetRegion, callback);
                        sw.forAllOverlapping(targetRegion, callback);
                    }
                };
                
                // Distribute an object to the child regions
                this.placeObject = (quadObject) => {
                    if (bbOverlaps(region, quadObject.bounds)) {
                        ne.placeObject(quadObject);
                        nw.placeObject(quadObject);
                        se.placeObject(quadObject);
                        sw.placeObject(quadObject);
                    }
                }
            }
            
            // Leafnode behaviour for forAllOverlapping
            this.forAllOverlapping = (targetRegion, callback) => {
                // Pretty simple: callback if the region overlaps the target region
                if (bbOverlaps(region, targetRegion)) {
                    callback(this);
                }
            };
            
            // A leaf partition contains objects (these get deleted when child nodes are added)
            this.objects = [];
            
            // Leafnode behaviour for placeObject
            this.placeObject = (quadObject) => {
                // Add the object only if it overlaps the region represented by this partition
                if (bbOverlaps(region, quadObject.bounds)) {
                    this.objects.push(quadObject);
                }
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
        
        /** Places an object in this partition */
        placeObject: (QuadObject) => void;
        
        /** The objects in this partition (unset for items with child nodes) */
        objects: QuadObject[];
    }
    
    /**
     * A quadtree is a way of representing items in space.
     *
     * Its main use is finding objects that are on-camera as well as finding objects that are potentially
     * in collision.
     */
    export class QuadTree {
        private _mainPartition: Partition;
        
        constructor() {
            // The initial partition covers the region from -1,-1 to 1,1
            this._mainPartition = new Partition({ x:-1, y:-1, width:2, height: 2});
        }
    }
}
