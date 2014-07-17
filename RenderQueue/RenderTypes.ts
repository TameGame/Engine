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
     * Interface representing a bounding box
     */
    export interface BoundingBox extends Point2D, Size {
    }
    
    /** Calculates the dot product of two vectors*/
    export function dot(p1: Point2D, p2: Point2D) {
        return p1.x*p2.x + p1.y*p2.y;
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
