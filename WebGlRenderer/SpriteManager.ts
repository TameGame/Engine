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
    }
    
    /**
     * The sprite asset manager for WebGL projects
     */
    export class WebGlSpriteManager implements SpriteManager {
        private _gl: WebGLRenderingContext;
        private _textureForUrl: { [name: string]: WebGLTexture };
        private _spriteForId: { [id: number]: WebGlSprite; }
        private _nextSpriteId: number;
        
        constructor(gl: WebGLRenderingContext) {
            this._gl            = gl;
            this._textureForUrl = {};
            this._spriteForId   = {};
            this._nextSpriteId  = 0;
        }
        
        /**
         * Retrieves the sprite map for this object
         *
         * The sprite map object doesn't change, so the caller can retain a reference to this if it needs to
         */
        getSpriteMap(): { [id: number]: WebGlSprite; } {
            return this._spriteForId;
        }
        
        /**
         * Loads a temporary 'nonexistent' texture into a WebGL texture, for while we're waiting for a texture to load
         */
        loadNonExistentTexture(texture: WebGLTexture) {
            var gl = this._gl;

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 8,8, 0, gl.RGBA, gl.UNSIGNED_BYTE, nonExistentTexturePixels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        
        /**
         * Starts loading a texture from a URL
         */
        loadTexture(url: string): WebGLTexture {
            var gl = this._gl;
            
            // Re-use any texture we might have already loaded
            var texture = this._textureForUrl[url];
            if (texture) {
                return texture;
            }
            
            // Generate the texture
            texture = gl.createTexture();
            if (!texture) {
                throw ERR_CantCreateTexture;
            }
            
            // Cache this texture
            this._textureForUrl[url] = texture;
            
            // Use a placeholder for the texture while we load
            this.loadNonExistentTexture(texture);
            
            // Start loading the image
            var image = new Image();
            
            // Once the texture image loads, bind it to the texture
            image.onload = () => {
                // TODO: if the image is not a power of 2, generate a resized image
                
                // Fill the texture bytes from the image we just loaded
                // We use pre-multiplied alpha when loading images
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                
                // Set the texture parameters
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                
                // Ensure that the texture has mipmaps
                gl.generateMipmap(gl.TEXTURE_2D);
                
                // Finished with the texture
                gl.bindTexture(gl.TEXTURE_2D, null);
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
        loadSpriteSheet(assetName: string, sheet: SpriteSheet): SpriteIdentifiers {
            var identifiers: SpriteIdentifiers;
            
            // Assign any missing IDs to the sheet
            Object.keys(sheet).forEach((spriteName) => {
                var sprite = sheet[spriteName];
                
                // Assign an ID if one isn't already assigned
                if (typeof sprite.id === 'undefined' || sprite.id === null) {
                    sprite.id = this._nextSpriteId++;
                }
                
                // Set the identifiers
                identifiers[spriteName] = sprite.id;
            });
            
            // Load the asset
            var texture = this.loadTexture(assetName);
            
            // Generate sprites
            Object.keys(sheet).forEach((spriteName) => {
                var sprite = sheet[spriteName];
                var bounds = sprite.bounds;
                var spriteDefn: WebGlSprite = {
                    texture: texture,
                    coords: new Float32Array([  bounds.x, bounds.y, 
                                                bounds.x+bounds.width, bounds.y,
                                                bounds.x, bounds.y+bounds.height,
                                                bounds.x+bounds.width, bounds.y+bounds.height ])
                };
                
                this._spriteForId[sprite.id] = spriteDefn;
            });
            
            return identifiers;
        }
        
        /**
         * Loads an image file as a single sprite
         *
         * Sprite assets usually come in the form of .png files
         */
        loadSprite(assetName: string, id?: number): number {
            // Choose an ID for this sprite
            if (typeof id === 'undefined' || id === null) {
                id = this._nextSpriteId++;
            }
            
            // Generate the sprite
            var sprite: WebGlSprite = {
                texture: this.loadTexture(assetName),
                coords: new Float32Array([ 0,0, 1,0, 0,1, 1,1 ])
            };

            // Store it
            this._spriteForId[id] = sprite;
            
            // Result is the ID
            return id;
        }

        /**
         * Indicates an action that should be taken when all the assets that are currently loaded are available
         */
        whenLoaded(action: () => void): void {
            // TODO: implement me
        }
    }
}
