module TameGame {
    /**
     * Interface representing a point in 2D space
     */
    export interface Point2D {
        x: number;
        y: number;
    }
    
    /**
     * Interface representing the size of something
     */
    export interface Size {
        width: number;
        height: number;
    }
    
    /**
     * Interface representing a Quad (4 points)
     */
    export interface Quad {
        /** Top-left coordinate */
        x1: number; y1: number;
        
        /** Top-right coordinate */
        x2: number; y2: number;
        
        /** Bottom-left coordinate */
        x3: number; y3: number;
        
        /** Bottom-right coordinate */
        x4: number; y4: number;
    }
    
    /**
     * Returns true if the two bounding boxes overlap
     */
    export function bbOverlaps(b1: BoundingBox, b2: BoundingBox): boolean {
        return (Math.abs(b1.x-b2.x)*2 < (b1.width+b2.width)) && (Math.abs(b1.y-b2.y)*2 < (b1.height+b2.height));
    }
    
    /**
     * Returns true if the inner bounding box is entirely inside the outer one
     */
    export function bbContains(outer: BoundingBox, inner: BoundingBox): boolean {
        if (inner.x < outer.x || inner.y < outer.y) { 
            return false;
        }
        
        if (inner.x+inner.width > outer.x+outer.width || inner.y+inner.height > outer.y+outer.height) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Interface representing a bounding box
     */
    export interface BoundingBox extends Point2D, Size {
    }
    
    /** Calculates the dot product of two vectors*/
    export function dot(p1: Point2D, p2: Point2D) {
        return p1.x*p2.x + p1.y*p2.y;
    }
    
    /**
     * Adds two vectors
     */
    export function addVector(p1: Point2D, p2: Point2D) {
        return { x: p1.x + p2.x, y: p1.y + p2.y };
    }
    
    /**
     * Scale a vector by a factor
     */
    export function scaleVector(p: Point2D, factor: number) {
        return { x: p.x * factor, y: p.y * factor };
    }
    
    /** Converts a vector to a unit-length vector */
    export function unit(p1: Point2D): Point2D {
        var length = Math.sqrt(p1.x*p1.x + p1.y*p1.y);
        if (length === 0) return p1;
        
        return { x: p1.x/length, y: p1.y/length };
    }
    
    /**
     * Transforms a point using a transformation matrix 
     */
    export function transform(matrix: Float32Array, point: Point2D) {
        return {
            x: matrix[0]*point.x + matrix[1]*point.y + matrix[2],
            y: matrix[3]*point.x + matrix[4]*point.y + matrix[5]
        };
    }
    
    /** Multiplies two matrices */
    export function multiplyMatrix(a: Float32Array, b: Float32Array) {
        return new Float32Array([
            a[0]*b[0]+a[1]*b[3]+a[2]*b[6], a[0]*b[1]+a[1]*b[4]+a[2]*b[7], a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
            a[3]*b[0]+a[4]*b[3]+a[5]*b[6], a[3]*b[1]+a[4]*b[4]+a[5]*b[7], a[3]*b[2]+a[4]*b[5]+a[5]*b[8],
            a[6]*b[0]+a[7]*b[3]+a[8]*b[6], a[6]*b[1]+a[7]*b[4]+a[8]*b[7], a[6]*b[2]+a[7]*b[5]+a[8]*b[8]
        ]);
    }
    
    /** Transforms a quad with a matrix */
    export function transformQuad(matrix: Float32Array, quad: Quad): Quad {
        var p1 = transform(matrix, { x: quad.x1, y: quad.y1 });
        var p2 = transform(matrix, { x: quad.x2, y: quad.y2 });
        var p3 = transform(matrix, { x: quad.x3, y: quad.y3 });
        var p4 = transform(matrix, { x: quad.x4, y: quad.y4 });
        
        return { 
            x1: p1.x, y1: p1.y,
            x2: p2.x, y2: p2.y,
            x3: p3.x, y3: p3.y,
            x4: p4.x, y4: p4.y
        };
    }
    
    /** Creates the identity matrix */
    export function identityMatrix(): Float32Array {
        return new Float32Array([1,0,0, 0,1,0, 0,0,1]);
    }
    
    /** Creates a translation matrix */
    export function translateMatrix(distance: Point2D): Float32Array {
        return new Float32Array([1,0,distance.x, 0,1,distance.y, 0,0,1]);
    }
    
    /** Creates a rotation matrix */
    export function rotationMatrix(angleDegrees: number): Float32Array {
        var angleRadians = angleDegrees * Math.PI / 180.0;
        var cosT = Math.cos(angleRadians);
        var sinT = Math.sin(angleRadians);
        
        return new Float32Array([
            cosT, -sinT, 0,
            sinT, cosT,  0,
            0,    0,     1
        ]);
    }
}
