/// <reference path="Renderer.ts" />

module TameGame {
    function spriteInit(renderer: WebGlRenderer) {
        // Acquire variables
        var gl = renderer.getGl();
        
        // Set up the shaders
        var spriteVertexShaderSource =
            'attribute vec4 position;\n'                    +
            'uniform mat4 transformation;\n'                +
            'void main() {\n'                               +
            '  gl_Position = transformation * position;\n'  +
            '}\n'                                           ;
        var spriteFragmentShaderSource =
            'void main() {\n'                               +
            '  gl_FragColor = vec4(0,1,0,1);\n'             +
            '}\n'                                           ;
        
        var spriteShader        = renderer.compileShaderProgram(spriteVertexShaderSource, spriteFragmentShaderSource);
        var positionAttr        = gl.getAttribLocation(spriteShader, 'position');
        var transformationUni   = gl.getUniformLocation(spriteShader, 'transformation');
        
        var vertexArray = new Float32Array(8);
        var vertexBuffer = gl.createBuffer();
        
        // Return the rendering function
        return (item: RenderQueueItem) => {
            // The item should be a sprite action item
            var spriteItem = <SpriteAction> item;
            
            vertexArray[0] = spriteItem.position.topLeft.x;
            vertexArray[1] = spriteItem.position.topLeft.y;
            vertexArray[2] = spriteItem.position.topRight.x;
            vertexArray[3] = spriteItem.position.topRight.y;
            vertexArray[4] = spriteItem.position.bottomLeft.x;
            vertexArray[5] = spriteItem.position.bottomLeft.y;
            vertexArray[6] = spriteItem.position.bottomRight.x;
            vertexArray[7] = spriteItem.position.bottomRight.y;
            
            gl.useProgram(spriteShader);
            
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
