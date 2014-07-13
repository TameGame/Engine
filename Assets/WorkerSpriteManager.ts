/// <reference path="Interface.ts" />
/// <reference path="../Core/Worker.ts" />

module TameGame {
    /**
     * Sprite manager for use in the web worker
     */
    export class WorkerSpriteManager implements SpriteManager {
        private _nextSpriteId: number;
        
        constructor() {
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
            throw "Not implemented";
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
                action: workerLoadSprite,
                data: {
                    assetName: assetName,
                    id: id
                }
            };
            
            postMessage(msg, null);
            
            return id;
        }
    }
}
