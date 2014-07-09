/// <reference path="Renderer.ts" />

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
            vertexArray[0] = spriteItem.position.topLeft.x;
            vertexArray[1] = spriteItem.position.topLeft.y;
            vertexArray[2] = spriteItem.position.topRight.x;
            vertexArray[3] = spriteItem.position.topRight.y;
            vertexArray[4] = spriteItem.position.bottomLeft.x;
            vertexArray[5] = spriteItem.position.bottomLeft.y;
            vertexArray[6] = spriteItem.position.bottomRight.x;
            vertexArray[7] = spriteItem.position.bottomRight.y;
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
            
            gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionAttr);
            
            gl.uniformMatrix4fv(transformationUni, false, renderer.cameraMatrix);
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };
    }
    
    webGlRenderAction[spriteActionName] = spriteInit;
}
