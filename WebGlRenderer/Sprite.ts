/// <reference path="Renderer.ts" />

// TODO: it might be useful to make it possible to draw multiple sprites with one 
// request to reduce the time spent setting things up
// It's possible that the overhead imposed by JavaScript will overshadow any gains
// to be made, so I'm not doing this until it's possible to actually measure the
// benefit.

module TameGame {
    function spriteInit(renderer: WebGlRenderer) {
        // Acquire variables
        var gl          = renderer.getGl();
        var spriteMap   = renderer.sprites.getSpriteMap();
        
        // Set up the shaders
        var spriteVertexShaderSource =
            'attribute vec4 position;\n'                    +
            'attribute vec2 texCoord;\n'                    +
            ''                                              +
            'uniform mat4 transformation;\n'                +
            ''                                              +
            'varying highp vec2 vTexCoord;\n'               +
            ''                                              +
            'void main() {\n'                               +
            '  gl_Position = transformation * position;\n'  +
            '  vTexCoord = texCoord;\n'                     +
            '}\n'                                           ;
        
        var spriteFragmentShaderSource =
            'varying highp vec2 vTexCoord;\n'                   +
            'uniform sampler2D sampler;\n'                      +
            ''                                                  +                                                
            'void main() {\n'                                   +
            '  gl_FragColor = texture2D(sampler, vTexCoord);\n' +
            '}\n'                                           ;
        
        var spriteShader        = renderer.compileShaderProgram(spriteVertexShaderSource, spriteFragmentShaderSource);
        var positionAttr        = gl.getAttribLocation(spriteShader, 'position');
        var texCoordAttr        = gl.getAttribLocation(spriteShader, 'texCoord');
        var transformationUni   = gl.getUniformLocation(spriteShader, 'transformation');
        var samplerUni          = gl.getUniformLocation(spriteShader, 'shader');
        
        var vertexArray         = new Float32Array(8);
        var vertexBuffer        = gl.createBuffer();
        var texCoordBuffer      = gl.createBuffer();
        
        // Ensure that there's always a sprite we can use
        var noSpriteId          = renderer.sprites.loadSprite('missing.png');
        var noSprite            = spriteMap[noSpriteId];
        
        // Return the rendering function
        return (item: RenderQueueItem) => {
            // The item should be a sprite action item
            var spriteItem  = <SpriteAction> item;
            var sprite      = spriteMap[spriteItem.spriteId] || noSprite;
            
            gl.useProgram(spriteShader);
            
            // Set the texture data
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, sprite.coords, gl.STATIC_DRAW);
            
            gl.vertexAttribPointer(texCoordAttr, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(texCoordAttr);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sprite.texture);
            gl.uniform1i(samplerUni, 0);
            
            // Generate the vertices
            vertexArray[0] = spriteItem.position.x1;
            vertexArray[1] = spriteItem.position.y1;
            vertexArray[2] = spriteItem.position.x2;
            vertexArray[3] = spriteItem.position.y2;
            vertexArray[4] = spriteItem.position.x3;
            vertexArray[5] = spriteItem.position.y3;
            vertexArray[6] = spriteItem.position.x4;
            vertexArray[7] = spriteItem.position.y4;
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
            
            gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionAttr);
            
            gl.uniformMatrix4fv(transformationUni, false, renderer.cameraMatrix);
            
            // Draw the texture with pre-multiplied alpha
            gl.enable(gl.BLEND);
            gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };
    }
    
    webGlRenderAction[spriteActionName] = spriteInit;
}
