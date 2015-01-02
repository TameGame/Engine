/// <reference path="Interface.ts" />

module TameGame {
    /**
     * Loads a sprite sheet stored in the TexturePacker 'JSON (Hash)' format using a sprite and data manager
     *
     * See https://www.codeandweb.com/texturepacker for TexturePacker
     * There's also http://www.leshylabs.com/blog/posts/2013-12-03-Leshy_SpriteSheet_Tool.html
     */
    export function loadTpJsonSpriteSheet(spriteManager: SpriteManager, dataManager: DataManager, assetName: string) : Promise<SpriteIdentifiers> {
        return new Promise((resolve, reject) => {
            // Start by loading the JSON data
            dataManager.loadJsonData(assetName).then((texturePackerData) => {
                // TODO: this is a bit incomplete as I haven't been able to find actual documentation for this format
                // Rotated and trimmed sprites not supported yet
                
                // Decompose the data
                var frames  = texturePackerData.frames;
                var meta    = texturePackerData.meta;
                
                if (!frames || !meta) {
                    reject('JSON is not in TexturePacker format');
                    return;
                }
                
                // If the asset name contains a directory, then we need to prepend that to any images
                // Slightly hacky technique (can't use the usual 'a' element hack here)
                var lastSlash = assetName.lastIndexOf('/');                     // Probably some pathological cases we don't handle
                var uriPrefix = '';
                
                if (lastSlash >= 0) {
                    uriPrefix = assetName.substr(0, lastSlash+1);
                }
                
                // Need some details
                var imageWidth  = meta.size.w;
                var imageHeight = meta.size.h;
                var imageAsset  = meta.image;
                
                // Start creating a sprite sheet
                var spriteSheet: SpriteSheet = {};
                
                // Fill with definitions; note that we use 0-1 for sprite coordinates so we need to do some translation
                Object.keys(frames).forEach((frameName) => {
                    var frameDefn           = frames[frameName];
                    var frameBounds         = frameDefn.frame;
                    var spriteSourceSize    = frameDefn.spriteSourceSize;
                    var sourceSize          = frameDefn.sourceSize;
                    
                    // Create the initial sprite definition
                    var bounds = {  x: frameBounds.x/imageWidth, 
                                    y: frameBounds.y/imageHeight,
                                    width: frameBounds.w/imageWidth,
                                    height: frameBounds.h/imageHeight
                                };
                    var margin: Margin;

                    if (!frameDefn.rotated) {
                        margin = {
                            left:   spriteSourceSize.x/imageWidth,
                            top:    spriteSourceSize.y/imageHeight,
                            right:  (sourceSize.w-frameBounds.w-spriteSourceSize.x)/imageWidth,
                            bottom: (sourceSize.h-frameBounds.h-spriteSourceSize.y)/imageHeight
                        };
                    } else {
                        // The frame bounds have the right x,y coordinates but reversed widths and heights (sigh)
                        // The sprite source has reversed x and y coordinates too for bonus confusion
                        bounds.width = frameBounds.h/imageWidth;
                        bounds.height = frameBounds.w/imageHeight;

                        margin = {
                            right:   spriteSourceSize.y/imageWidth,
                            top:    spriteSourceSize.x/imageHeight,
                            left:  (sourceSize.h-frameBounds.h-spriteSourceSize.y)/imageWidth,
                            bottom: (sourceSize.w-frameBounds.w-spriteSourceSize.x)/imageHeight
                        };
                    }

                    var defn: SpriteDefinition = {
                        bounds:     bounds,
                        margin:     margin,
                        rotated:    frameDefn.rotated || false
                    };
                
                    spriteSheet[frameName] = defn;
                });
            
                // Load the texture using the sprite manager
                var identifiers = spriteManager.loadSpriteSheet(uriPrefix + imageAsset, spriteSheet);
            
                // Done
                resolve(identifiers);
            }).catch((e) => {
                // Just pass errors through
                reject(e);
            });
        });
    }
}
