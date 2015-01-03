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
     * Interface representing a margin around a rectangular object
     */
    export interface Margin {
        top: number;
        left: number;
        right: number;
        bottom: number;
    }
    
    /**
     * Returns true if the two bounding boxes overlap
     */
    export function bbOverlaps(a: BoundingBox, b: BoundingBox): boolean {
        var aMaxX = a.x + a.width;
        var bMaxX = b.x + b.width;
        
        if (aMaxX < b.x) return false;
        if (bMaxX < a.x) return false;
        
        var aMaxY = a.y + a.height;
        var bMaxY = b.y + b.height;
        
        if (aMaxY < b.y) return false;
        if (bMaxY < a.y) return false;
        
        return true;
    }
    
    /** Converts a bounding box to a quad */
    export function bbToQuad(bounds: BoundingBox): Quad {
        var minX = bounds.x;
        var minY = bounds.y;
        var maxX = bounds.x+bounds.width;
        var maxY = bounds.y+bounds.height;
        
        return {
            x1: minX, y1: minY,
            x2: maxX, y2: minY,
            x3: maxX, y3: maxY,
            x4: minX, y4: maxY
        };
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
    
    /**
     * Computes the bounding box of a quad
     */
    export function quadBoundingBox(quad: Quad): BoundingBox {
        var minX = Math.min(quad.x1, quad.x2, quad.x3, quad.x4);
        var minY = Math.min(quad.y1, quad.y2, quad.y3, quad.y4);
        var maxX = Math.max(quad.x1, quad.x2, quad.x3, quad.x4);
        var maxY = Math.max(quad.y1, quad.y2, quad.y3, quad.y4);
        
        return { x: minX, y: minY, width: maxX-minX, height: maxY-minY };
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
    
    /**
     * Converts a vector to a unit-length vector 
     */
    export function unit(p1: Point2D): Point2D {
        var length = Math.sqrt(p1.x*p1.x + p1.y*p1.y);
        if (length === 0) return p1;
        
        return { x: p1.x/length, y: p1.y/length };
    }
    
    /**
     * Transforms a point using a transformation matrix 
     */
    export function transform(matrix: number[], point: Point2D) {
        return {
            x: matrix[0]*point.x + matrix[1]*point.y + matrix[2],
            y: matrix[3]*point.x + matrix[4]*point.y + matrix[5]
        };
    }
    
    /** 
     * Multiplies two matrices 
     */
    export function multiplyMatrix(a: number[], b: number[]) {
        var r = [];

        var a00 = a[0], a01 = a[1], a02 = a[2];
        var a10 = a[3], a11 = a[4], a12 = a[5];
        var a20 = a[6], a21 = a[7], a22 = a[8];

        var b00 = b[0], b01 = b[1], b02 = b[2];
        var b10 = b[3], b11 = b[4], b12 = b[5];
        var b20 = b[6], b21 = b[7], b22 = b[8];

        r[0] = a00*b00 + a01*b10 + a02*b20;
        r[1] = a00*b01 + a01*b11 + a02*b21;
        r[2] = a00*b02 + a01*b12 + a02*b22;

        r[3] = a10*b00 + a11*b10 + a12*b20;
        r[4] = a10*b01 + a11*b11 + a12*b21;
        r[5] = a10*b02 + a11*b12 + a12*b22;

        r[6] = a20*b00 + a21*b10 + a22*b20;
        r[7] = a20*b01 + a21*b11 + a22*b21;
        r[8] = a20*b02 + a21*b12 + a22*b22;

        return r;
    }
    
    /** 
     * Transforms a quad with a matrix 
     */
    export function transformQuad(matrix: number[], quad: Quad): Quad {
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
    
    /** 
     * Creates the identity matrix 
     */
    export function identityMatrix(): number[] {
        return [1,0,0, 0,1,0, 0,0,1];
    }
    
    /**
     * Creates a translation matrix 
     */
    export function translateMatrix(distance: Point2D): number[] {
        var r: number[] = [];

        r[0] = 1;
        r[1] = 0;
        r[2] = distance.x;

        r[3] = 0;
        r[4] = 1;
        r[5] = distance.y;

        r[6] = 0;
        r[7] = 0;
        r[8] = 1;

        return r;
    }
    
    /** 
     * Creates a rotation+translation matrix
     */
    export function rotateTranslateMatrix(angleDegrees: number, translation: Point2D): number[] {
        var angleRadians = angleDegrees * Math.PI / 180.0;
        var cosT = Math.cos(angleRadians);
        var sinT = Math.sin(angleRadians);
        
        var r: number[] = [];

        r[0] = cosT;
        r[1] = -sinT;
        r[2] = translation.x;

        r[3] = sinT;
        r[4] = cosT;
        r[5] = translation.y;

        r[6] = 0;
        r[7] = 0;
        r[8] = 1;

        return r;
    }
    
    /** 
     * Creates a rotation matrix, optionally about a particular origin point
     */
    export function rotationMatrix(angleDegrees: number, origin?: Point2D): number[] {
        var angleRadians = angleDegrees * Math.PI / 180.0;
        var cosT = Math.cos(angleRadians);
        var sinT = Math.sin(angleRadians);
        
        var r: number[] = [];

        r[0] = cosT;
        r[1] = -sinT;
        r[2] = 0;

        r[3] = sinT;
        r[4] = cosT;
        r[5] = 0;

        r[6] = 0;
        r[7] = 0;
        r[8] = 1;

        if (origin) {
            var x = origin.x;
            var y = origin.y;

            r[2] = x - r[0]*x-r[1]*y;
            r[5] = y - r[3]*x-r[4]*y;
        }

        return r;
    }
}
