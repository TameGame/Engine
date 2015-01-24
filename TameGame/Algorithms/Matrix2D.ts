/// <reference path="Point2D.ts" />
/// <reference path="BoundingBox.ts" />

module TameGame {
    "use strict";

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
        var a00 = a[0], a01 = a[1], a02 = a[2];
        var a10 = a[3], a11 = a[4], a12 = a[5];
        var a20 = a[6], a21 = a[7], a22 = a[8];

        var b00 = b[0], b01 = b[1], b02 = b[2];
        var b10 = b[3], b11 = b[4], b12 = b[5];
        var b20 = b[6], b21 = b[7], b22 = b[8];

        var r = [
            a00*b00 + a01*b10 + a02*b20,
            a00*b01 + a01*b11 + a02*b21,
            a00*b02 + a01*b12 + a02*b22,

            a10*b00 + a11*b10 + a12*b20,
            a10*b01 + a11*b11 + a12*b21,
            a10*b02 + a11*b12 + a12*b22,

            a20*b00 + a21*b10 + a22*b20,
            a20*b01 + a21*b11 + a22*b21,
            a20*b02 + a21*b12 + a22*b22
        ];

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
        var r: number[] = [
            1,0, distance.x,
            0,1, distance.y,
            0,0, 1
        ];

        return r;
    }
    
    /** 
     * Creates a rotation+translation matrix
     */
    export function rotateTranslateMatrix(angleDegrees: number, translation: Point2D): number[] {
        var angleRadians = angleDegrees * Math.PI / 180.0;
        var cosT = Math.cos(angleRadians);
        var sinT = Math.sin(angleRadians);
        
        var r: number[] = [
            cosT, -sinT, translation.x,
            sinT, cosT, translation.y, 
            0, 0, 1
        ];

        return r;
    }
    
    /** 
     * Creates a rotation matrix, optionally about a particular origin point
     */
    export function rotationMatrix(angleDegrees: number, origin?: Point2D): number[] {
        var angleRadians = angleDegrees * Math.PI / 180.0;
        var cosT = Math.cos(angleRadians);
        var sinT = Math.sin(angleRadians);
        
        var r: number[] = [
            cosT, -sinT, 0,
            sinT, cosT, 0, 
            0, 0, 1
        ];

        if (origin) {
            var x = origin.x;
            var y = origin.y;

            r[2] = x - r[0]*x-r[1]*y;
            r[5] = y - r[3]*x-r[4]*y;
        }

        return r;
    }

    var min = Math.min;
    var max = Math.max;

    /**
     * Transforms a bounding box using a matrix
     */
    export function transformBoundingBox(bounds: BoundingBox, matrix: number[]): BoundingBox {
        // Get the min/max coordinates
        var minX = bounds.x;
        var minY = bounds.y;
        var maxX = minX + bounds.width;
        var maxY = minY + bounds.height;

        // Multiply by the matrix columns
        var xa  = [ minX*matrix[0], minX*matrix[3] ];
        var xb  = [ maxX*matrix[0], maxX*matrix[3] ];

        var ya  = [ minY*matrix[1], minY*matrix[4] ];
        var yb  = [ maxY*matrix[1], maxY*matrix[4] ];

        // Combine to produce the result
        var newMinX = min(xa[0], xb[0]) + min(ya[0], yb[0]) + matrix[2];
        var newMinY = min(xa[1], xb[1]) + min(ya[1], yb[1]) + matrix[5];
        var newMaxX = max(xa[0], xb[0]) + max(ya[0], yb[0]) + matrix[2];
        var newMaxY = max(xa[1], xb[1]) + max(ya[1], yb[1]) + matrix[5];

        return {
            x: newMinX,
            y: newMinY,
            width: newMaxX - newMinX,
            height: newMaxY - newMinY
        };
    }
}
