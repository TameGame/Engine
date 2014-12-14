/// <reference path="Interface.ts" />
/// <reference path="../Core/Worker.ts" />

module TameGame {
    /**
     * Sprite manager for use in the web worker
     */
    export class WorkerSpriteManager implements SpriteManager {
        private _nextSpriteId: number;
        
        constructor() {
            this._nextSpriteId = 0;
        }

        /**
         * Indicates an action that should be taken when all the assets that are currently loaded are available
         */
        whenLoaded(action: () => void): void {
            // TODO: implement me
        }
        
        /**
         * Starts to load a sprite sheet and assigns identifiers to the contents
         *
         * Sprite assets usually come in the form of .png files.
         */
        loadSpriteSheet(assetName: string, sheet: SpriteSheet): SpriteIdentifiers {
            var identifiers: SpriteIdentifiers = {};
            
            // Assign IDs prior to sending
            Object.keys(sheet).forEach((spriteName) => {
                var sprite = sheet[spriteName];
                if (typeof sprite.id === 'undefined' || sprite.id === null) {
                    sprite.id = this._nextSpriteId++;
                }
                
                identifiers[spriteName] = sprite.id;
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
        loadSprite(assetName: string, id?: number): number {
            // Assign an ID
            if (typeof id === 'undefined' || id === null) {
                id = this._nextSpriteId++;
            }
            
            // Post a request
            var msg: WorkerMessage = {
                action: workerMessages.loadSprite,
                data: {
                    assetName: assetName,
                    id: id
                }
            };
            
            postMessage(msg, undefined);            // 2nd argument is a hack around TypeScript's lack of knowledge of WebWorkers
            
            return id;
        }
    }
}
