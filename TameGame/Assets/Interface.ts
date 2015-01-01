/// <reference path="../../ThirdParty/DefinitelyTyped/es6-promise.d.ts"/>
/// <reference path="../RenderQueue/RenderTypes.ts" />

module TameGame {
    /**
     * Interface implemented by objects that queue up load requests in the background
     */
    export interface AssetLoader {
        /**
         * Indicates an action that should be taken when all the assets that are currently loaded are available
         */
        whenLoaded(action: () => void): void;
    }
    
    /**
     * A sprite definition describes where on a source image a particular sprite can be found
     */
    export interface SpriteDefinition {
        /** The bounding box of the sprite on the source image, in pixels */
        bounds: BoundingBox;

        /** True if the sprite has been rotated by 90 degrees */
        rotated: boolean;

        /**
         * The ID to assign to this sprite
         *
         * This should usually be left empty: the asset manager will assign IDs automatically.
         * The main use of this is so that a worker can assign IDs and ensure that the same
         * IDs will be used by the main renderer.
         */
        id?: number;
    }
    
    /**
     * A sprite sheet describes how to divide an image file down into sprites
     */
    export interface SpriteSheet {
        [name: string]: SpriteDefinition;
    }
    
    /**
     * SpriteIdentifiers map names from a sprite sheet onto sprite identifiers
     */
    export interface SpriteIdentifiers {
        [name: string]: number;
    }
    
    /**
     * The sprite manager handles loading sprite sheets and assigning IDs to them
     */
    export interface SpriteManager extends AssetLoader {
        /**
         * Starts to load a sprite sheet and assigns identifiers to the contents
         *
         * Sprite assets usually come in the form of .png files.
         */
        loadSpriteSheet(assetName: string, sheet: SpriteSheet): SpriteIdentifiers;
        
        /**
         * Loads an image file as a single sprite
         *
         * Sprite assets usually come in the form of .png files
         */
        loadSprite(assetName: string, id?: number): number;
    }
    
    /**
     * The data manager handles loading data objects
     */
    export interface DataManager extends AssetLoader {
        /**
         * Loads some JSON data
         */
        loadJsonData(assetName: string) : Promise<any>;
    }
}
