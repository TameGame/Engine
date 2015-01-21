/// <reference path="Renderer.ts" />

// TODO: it might be useful to make it possible to draw multiple sprites with one 
// request to reduce the time spent setting things up
// It's possible that the overhead imposed by JavaScript will overshadow any gains
// to be made, so I'm not doing this until it's possible to actually measure the
// benefit.

module TameGame {
    "use strict";

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
            'uniform highp vec4 margin;\n'                      +
            ''                                                  +                                                
            'void main() {\n'                                   +
            '  if (vTexCoord.x < margin[0] || vTexCoord.y < margin[1] || vTexCoord.x > margin[2] || vTexCoord.y > margin[3]) {\n' +
            '    gl_FragColor = vec4(0,0,0,0);\n'               +
            '  } else {\n'                                      +
            '    gl_FragColor = texture2D(sampler, vTexCoord);\n' +
            '  }\n'                                             +
            '}\n'                                               ;
        
        var spriteShader        = renderer.compileShaderProgram(spriteVertexShaderSource, spriteFragmentShaderSource);
        var positionAttr        = gl.getAttribLocation(spriteShader, 'position');
        var texCoordAttr        = gl.getAttribLocation(spriteShader, 'texCoord');
        var transformationUni   = gl.getUniformLocation(spriteShader, 'transformation');
        var samplerUni          = gl.getUniformLocation(spriteShader, 'shader');
        var marginUni           = gl.getUniformLocation(spriteShader, 'margin');
        
        var vertexArray         = new Float32Array(8);
        var vertexBuffer        = gl.createBuffer();
        var texCoordBuffer      = gl.createBuffer();
        
        // Ensure that there's always a sprite we can use
        var noSpriteId          = renderer.sprites.loadSprite('missing.png');
        var noSprite            = spriteMap[noSpriteId];
        
        // Return the rendering function
        return (item: RenderQueueItem) => {
            // The item should be a sprite action item
            var sprite      = spriteMap[item.intValues[0]] || noSprite;
            var cameraId    = item.intValues[1];
            
            gl.useProgram(spriteShader);
            
            // Set the texture data
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, sprite.coords, gl.STATIC_DRAW);
            
            gl.vertexAttribPointer(texCoordAttr, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(texCoordAttr);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sprite.texture);
            gl.uniform1i(samplerUni, 0);
            gl.uniform4fv(marginUni, sprite.margin);
            
            // Generate the vertices
            vertexArray[0] = item.floatValues[0];
            vertexArray[1] = item.floatValues[1];
            vertexArray[2] = item.floatValues[2];
            vertexArray[3] = item.floatValues[3];
            vertexArray[4] = item.floatValues[4];
            vertexArray[5] = item.floatValues[5];
            vertexArray[6] = item.floatValues[6];
            vertexArray[7] = item.floatValues[7];
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
            
            gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionAttr);
            
            gl.uniformMatrix4fv(transformationUni, false, renderer.cameraMatrix[cameraId]);
            
            // Draw the texture with pre-multiplied alpha
            gl.enable(gl.BLEND);
            gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };
    }
    
    webGlRenderAction[Actions.drawSprite] = spriteInit;
}
