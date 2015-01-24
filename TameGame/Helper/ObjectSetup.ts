/// <reference path="../Core/Interface.ts" />
/// <reference path="../Sprite/Sprite.ts" />
/// <reference path="../Physics/Physics.ts" />

module TameGame {
    "use strict";

    /**
     * Some fluent methods used to help set up an object
     */
    export interface ObjectSetup {
        /**
         * Sets up this object as a new sprite with a particular width and height
         */
        sprite(assetId: number, width?: number, height?: number): ObjectSetup;

        /**
         * Changes the size of this object to be the specified width and height
         */
        size(width: number, height: number): ObjectSetup;

        /**
         * Specifies the collision shape of this object
         */
        shape(newShape: Shape): ObjectSetup;

        /**
         * Specifies the shape of this object as matching its size (ie, basically a square or a rectangle)
         */
        useBasicShape(): ObjectSetup;

        /**
         * Moves this object to a particular location
         */
        moveTo(x: number, y: number): ObjectSetup;

        /**
         * Rotates this object to a particular angle
         */
        rotateTo(degrees: number): ObjectSetup;
    }

    export interface TameObject {
        /**
         * Convienience methods for setting up an object
         */
        setup: ObjectSetup;
    }

    export class ContextualObjectSetup implements ObjectSetup {
        /** Context, set as part of a contextual field*/
        _context: TameObject;

        /**
         * Sets up this object as a new sprite with a particular width and height
         */
        sprite(assetId: number, width?: number, height?: number): ObjectSetup {
            var obj = this._context;

            obj.sprite.assetId = assetId;

            if (arguments.length >= 3) {
                return this.size(width, height);
            } else {
                return this;
            }
        }

        /**
         * Changes the size of this object to be the specified width and height
         */
        size(width: number, height: number): ObjectSetup {
            var obj = this._context;

            var halfWidth   = width/2.0;
            var halfHeight  = height/2.0;

            obj.position.quad = {
                x1: -halfWidth, y1: halfHeight,
                x2: halfWidth,  y2: halfHeight,
                x3: -halfWidth, y3: -halfHeight,
                x4: halfWidth,  y4: -halfHeight
            };

            return this;
        }

        /**
         * Specifies the collision shape of this object
         */
        shape(newShape: Shape): ObjectSetup {
            var obj = this._context;

            obj.presence.shape = newShape;

            return this;
        }

        /**
         * Moves this object to a particular location
         */
        moveTo(x: number, y: number): ObjectSetup {
            var obj = this._context;

            obj.presence.location = { x: x, y: y };

            return this;
        }

        /**
         * Rotates this object to a particular angle
         */
        rotateTo(degrees: number): ObjectSetup {
            var obj = this._context;

            obj.presence.rotation = degrees;

            return this;
        }

        /**
         * Specifies the shape of this object as matching its size (ie, basically a square or a rectangle)
         */
        useBasicShape(): ObjectSetup {
            var obj = this._context;

            var pos = obj.position.quad;
            obj.presence.shape = new Polygon([
                { x: pos.x1, y: pos.y1 },
                { x: pos.x2, y: pos.y2 },
                { x: pos.x4, y: pos.y4 },
                { x: pos.x3, y: pos.y3 }
            ]);

            return this;
        }
    }
}
