/// <reference path="../RenderQueue/RenderQueue.ts" />
/// <reference path="../Core/Core.ts" />

module TameGame {
    "use strict";

    /**
     * The position property describes where a sprite is on screen
     */
    export interface IPosition {
        /** The location of this item, as a quad */
        quad: Quad;

        /** Where this sprite should be rendered relative to other sprites */
        zIndex: number
    }
    
    export interface TameObject {
        position?: IPosition;
    }
    
    /**
     * The position property describes where a sprite is on screen
     */
    export var Position: PropertyDefinition<IPosition> = declareProperty("position", () => {
        return {
            quad: {
                x1: 0, y1: 0,
                x2: 0, y2: 0,
                x3: 0, y3: 0,
                x4: 0, y4: 0
            },
            
            zIndex: 0
        };
    });
            
    /**
     * The sprite property describes the sprite that should be displayed by a particular object
     */
    export interface ISprite {
        /** The asset ID of this sprite */
        assetId: number;
    }
    
    export interface TameObject {
        sprite?: ISprite;
    }
    
    /**
     * The sprite property describes the sprite that should be displayed by a particular object
     */
    export var Sprite: PropertyDefinition<ISprite> = declareProperty("sprite", () => {
        return {
            // Asset ID -1 indicates no sprite
            assetId: -1
        }
    });
}
