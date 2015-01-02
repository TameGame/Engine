/// <reference path="Interface.ts" />
/// <reference path="../Core/Worker.ts" />

module TameGame {
    /**
     * Sprite manager for use in the web worker
     */
    export class WorkerSpriteManager implements SpriteManager {
        constructor() {
            var _nextSpriteId: number;
            var _properties: { [id: number]: SpriteProperties };

            _nextSpriteId   = 0;
            _properties     = {};

            /**
             * Indicates an action that should be taken when all the assets that are currently loaded are available
             */
            var whenLoaded = (action: () => void): void => {
                // TODO: implement me
            }
            
            /**
             * Starts to load a sprite sheet and assigns identifiers to the contents
             *
             * Sprite assets usually come in the form of .png files.
             */
            var loadSpriteSheet = (assetName: string, sheet: SpriteSheet): SpriteIdentifiers => {
                var identifiers: SpriteIdentifiers = {};
                
                // Assign IDs prior to sending
                Object.keys(sheet).forEach((spriteName) => {
                    var sprite = sheet[spriteName];
                    if (typeof sprite.id === 'undefined' || sprite.id === null) {
                        sprite.id = _nextSpriteId++;
                    }
                    
                    identifiers[spriteName] = sprite.id;

                    // Store the properties for this sprite
                    _properties[sprite.id] = { margin: sprite.margin };
                });
                
                var msg: WorkerMessage = {
                    action: workerMessages.loadSpriteSheet,
                    data: {
                        assetName: assetName,
                        sheet: sheet
                    }
                };
                
                postMessage(msg, undefined);
                
                return identifiers;
            }
            
            /**
             * Loads an image file as a single sprite
             *
             * Sprite assets usually come in the form of .png files
             */
            var loadSprite = (assetName: string, id?: number): number => {
                // Assign an ID
                if (typeof id === 'undefined' || id === null) {
                    id = _nextSpriteId++;
                }
                
                // Post a request
                var msg: WorkerMessage = {
                    action: workerMessages.loadSprite,
                    data: {
                        assetName: assetName,
                        id: id
                    }
                };

                _properties[id] = { margin: { left:0, right:0, top: 0, bottom: 0 } };
                
                postMessage(msg, undefined);            // 2nd argument is a hack around TypeScript's lack of knowledge of WebWorkers
                
                return id;
            }

            /**
             * Retrieves the properties for the sprite with the specified identifier
             *
             * Returns null if the sprite has not been loaded
             */
            var propertiesForSprite = (id: number): SpriteProperties => {
                return _properties[id] || null;
            };

            this.whenLoaded             = whenLoaded;
            this.loadSpriteSheet        = loadSpriteSheet;
            this.loadSprite             = loadSprite;
            this.propertiesForSprite    = propertiesForSprite;
        }

        /**
         * Indicates an action that should be taken when all the assets that are currently loaded are available
         */
        whenLoaded: (action: () => void) => void;
        
        /**
         * Starts to load a sprite sheet and assigns identifiers to the contents
         *
         * Sprite assets usually come in the form of .png files.
         */
        loadSpriteSheet: (assetName: string, sheet: SpriteSheet) => SpriteIdentifiers;
        
        /**
         * Loads an image file as a single sprite
         *
         * Sprite assets usually come in the form of .png files
         */
        loadSprite: (assetName: string, id?: number) => number;

        /**
         * Retrieves the properties for the sprite with the specified identifier
         *
         * Returns null if the sprite has not been loaded
         */
        propertiesForSprite: (id: number) => SpriteProperties;
    }
}
