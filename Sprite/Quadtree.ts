/// <reference path="../RenderQueue/RenderTypes.ts" />

module TameGame {
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
            }
            
            // Leafnode behaviour for forAllOverlapping
            this.forAllOverlapping = (targetRegion, callback) => {
                // Pretty simple: callback if the region overlaps the target region
                if (bbOverlaps(region, targetRegion)) {
                    callback(this);
                }
            };
            
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
            }
        }
        
        /** Subdivides this partition into 4 other partitions */
        subdivide: () => void;
        
        /** Creates a parent partition */
        createParent: () => Partition;
        
        /** Calls an iterator to find all the leaf partitions that overlap a particular bounding box */
        forAllOverlapping: (region: BoundingBox, callback: (partition: Partition) => void) => void;
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
