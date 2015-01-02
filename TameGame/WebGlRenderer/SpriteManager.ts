/// <reference path="../RenderQueue/RenderQueue.ts" />

module TameGame {
    export var ERR_CantCreateTexture = "Unable to create GL texture";
    
    // Generate a 8x8 RGBA cross to represent a texture that doesn't exist
    var nonExistSource: number[] = [];
    for (var y=0; y<8; y++) {
        for (var x=0; x<8; ++x) {
            if (x == y || (7-x) == y) {
                nonExistSource.push(255,0,0,255);
            } else {
                nonExistSource.push(255,255,255,255);
            }
        }
    }
    var nonExistentTexturePixels = new Uint8Array(nonExistSource);
    
    /**
     * Represents the definition of a loaded sprite
     */
    export interface WebGlSprite {
        /** The texture that the sprite is defined on */
        texture: WebGLTexture;
        
        /** The coordinates within the texture for this sprite */
        coords: Float32Array;

        /** The margin of transparent pixels that should surround this sprite (ordered: left, top, right, bottom) */
        margin: Float32Array;
    }
    
    /**
     * The sprite asset manager for WebGL projects
     */
    export class WebGlSpriteManager implements SpriteManager {
        constructor(gl: WebGLRenderingContext) {
            // Private variables
            var _gl: WebGLRenderingContext;
            var _textureForUrl: { [name: string]: WebGLTexture };
            var _spriteForId: { [id: number]: WebGlSprite; }
            var _nextSpriteId: number;
            var _spriteProperties: { [id: number]: SpriteProperties };
            
            _gl                 = gl;
            _textureForUrl      = {};
            _spriteForId        = {};
            _nextSpriteId       = 0;
            _spriteProperties   = {};

            // Set up the functions for this object
            
            /**
             * Retrieves the sprite map for this object
             *
             * The sprite map object doesn't change, so the caller can retain a reference to this if it needs to
             */
            var getSpriteMap = (): { [id: number]: WebGlSprite; } => {
                return _spriteForId;
            }
            
            /**
             * Loads a temporary 'nonexistent' texture into a WebGL texture, for while we're waiting for a texture to load
             */
            var loadNonExistentTexture = (texture: WebGLTexture) => {
                _gl.bindTexture(gl.TEXTURE_2D, texture);
                _gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8,8, 0, gl.RGBA, gl.UNSIGNED_BYTE, nonExistentTexturePixels);
                _gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                _gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                _gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                _gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                _gl.bindTexture(gl.TEXTURE_2D, null);
            }
            
            /**
             * Starts loading a texture from a URL
             */
            var loadTexture = (url: string): WebGLTexture => {
                // Re-use any texture we might have already loaded
                var texture = _textureForUrl[url];
                if (texture) {
                    return texture;
                }
                
                // Generate the texture
                texture = _gl.createTexture();
                if (!texture) {
                    throw ERR_CantCreateTexture;
                }
                
                // Cache this texture
                _textureForUrl[url] = texture;
                
                // Use a placeholder for the texture while we load
                loadNonExistentTexture(texture);
                
                // Start loading the image
                var image = new Image();
                
                // Once the texture image loads, bind it to the texture
                image.onload = () => {
                    // TODO: if the image is not a power of 2, generate a resized image
                    
                    // Fill the texture bytes from the image we just loaded
                    // We use pre-multiplied alpha when loading images
                    _gl.bindTexture(_gl.TEXTURE_2D, texture);
                    _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
                    _gl.texImage2D(_gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                    
                    // Set the texture parameters
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_LINEAR);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_S, _gl.CLAMP_TO_EDGE);
                    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_WRAP_T, _gl.CLAMP_TO_EDGE);
                    
                    // Ensure that the texture has mipmaps
                    _gl.generateMipmap(_gl.TEXTURE_2D);
                    
                    // Finished with the texture
                    _gl.bindTexture(_gl.TEXTURE_2D, null);
                }
                
                // Deal with aborts and failed loads
                image.onabort = image.onerror = (ev) => {
                    console.error('Error while loading image from ' + url + ':', ev);
                }
                
                // Setting the image source has the side-effect of starting to load it
                image.src = url;
                
                // The texture can be used immediately, though it won't contain the image for a while
                return texture;
            }
            
            /**
             * Starts to load a sprite sheet and assigns identifiers to the contents
             *
             * Sprite assets usually come in the form of .png files.
             */
            var loadSpriteSheet = (assetName: string, sheet: SpriteSheet): SpriteIdentifiers => {
                var identifiers: SpriteIdentifiers = {};
                
                // Assign any missing IDs to the sheet
                Object.keys(sheet).forEach((spriteName) => {
                    var sprite = sheet[spriteName];
                    
                    // Assign an ID if one isn't already assigned
                    if (typeof sprite.id === 'undefined' || sprite.id === null) {
                        sprite.id = _nextSpriteId++;
                    }
                    
                    // Set the identifiers
                    identifiers[spriteName] = sprite.id;
                });
                
                // Load the asset
                var texture = loadTexture(assetName);
                
                // Generate sprites
                Object.keys(sheet).forEach((spriteName) => {
                    var sprite = sheet[spriteName];
                    var bounds = sprite.bounds;
                    var margin = sprite.margin;

                    var coords: Float32Array;
                    var transform: Float32Array;

                    // Pick the standard or rotated coordinates depending on if the flag is set
                    if (!sprite.rotated) {
                        coords = new Float32Array([ bounds.x, bounds.y, 
                                                    bounds.x+bounds.width, bounds.y,
                                                    bounds.x, bounds.y+bounds.height,
                                                    bounds.x+bounds.width, bounds.y+bounds.height ]);
                    } else {
                        coords = new Float32Array([ bounds.x+bounds.width, bounds.y,
                                                    bounds.x+bounds.width, bounds.y+bounds.height,
                                                    bounds.x, bounds.y, 
                                                    bounds.x, bounds.y+bounds.height ]);
                    }

                    // Generate the sprite definition
                    var spriteDefn: WebGlSprite = {
                        texture:    texture,
                        coords:     coords,
                        margin:     new Float32Array([ margin.left, margin.top, margin.right, margin.bottom ])
                    };
                    
                    _spriteForId[sprite.id] = spriteDefn;

                    // Create default properties
                    _spriteProperties[sprite.id] = { margin: { top: 0, left: 0, right: 0, bottom: 0 } };
                });
                
                return identifiers;
            };
            
            /**
             * Loads an image file as a single sprite
             *
             * Sprite assets usually come in the form of .png files
             */
            var loadSprite = (assetName: string, id?: number): number => {
                // Choose an ID for this sprite
                if (typeof id === 'undefined' || id === null) {
                    id = _nextSpriteId++;
                }
                
                // Generate the sprite
                var sprite: WebGlSprite = {
                    texture:    loadTexture(assetName),
                    coords:     new Float32Array([ 0,0, 1,0, 0,1, 1,1 ]),
                    margin:     new Float32Array([ 0,0,0,0 ])
                };

                // Store it
                _spriteForId[id] = sprite;

                // Create default properties
                _spriteProperties[id] = { margin: { top: 0, left: 0, right: 0, bottom: 0 } };
                
                // Result is the ID
                return id;
            };

            /**
             * Indicates an action that should be taken when all the assets that are currently loaded are available
             */
            var whenLoaded = (action: () => void): void => {
                // TODO: implement me
            };

            /**
             * Retrieves the properties for the sprite with the specified identifier
             *
             * Returns null if the sprite has not been loaded
             */
            var propertiesForSprite     = (id: number): SpriteProperties => {
                return _spriteProperties[id] || null;
            };

            // Store the functions
            this.getSpriteMap           = getSpriteMap;
            this.loadNonExistentTexture = loadNonExistentTexture;
            this.loadTexture            = loadTexture;
            this.loadSpriteSheet        = loadSpriteSheet;
            this.loadSprite             = loadSprite;
            this.whenLoaded             = whenLoaded;
            this.propertiesForSprite    = propertiesForSprite;
        }
        
        /**
         * Retrieves the sprite map for this object
         *
         * The sprite map object doesn't change, so the caller can retain a reference to this if it needs to
         */
        getSpriteMap: () => { [id: number]: WebGlSprite; };
        
        /**
         * Loads a temporary 'nonexistent' texture into a WebGL texture, for while we're waiting for a texture to load
         */
        loadNonExistentTexture: (texture: WebGLTexture) => void;
        
        /**
         * Starts loading a texture from a URL
         */
        loadTexture: (url: string) => WebGLTexture;
        
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

        /**
         * Indicates an action that should be taken when all the assets that are currently loaded are available
         */
        whenLoaded: (action: () => void) => void;
    }
}
