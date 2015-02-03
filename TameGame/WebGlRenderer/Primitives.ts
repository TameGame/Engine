/// <reference path="Renderer.ts" />

module TameGame {
    "use strict";

    function lineInit(renderer: WebGlRenderer) {
        var gl          = renderer.getGl();

        // Set up the shaders
        var primitiveVertexShaderSource =
            'attribute vec4 position;\n'                    +
            ''                                              +
            'uniform mat4 cameraTransform;\n'               +
            'uniform mat4 objectTransform;\n'               +
            'uniform highp vec4 color;\n'                   +
            ''                                              +
            'void main() {\n'                               +
            '  gl_Position = cameraTransform * objectTransform * position;\n'  +
            '}\n'                                           ;
        
        var primitiveFragmentShaderSource =
            'uniform sampler2D sampler;\n'                      +
            'uniform highp vec4 color;\n'                       +
            ''                                                  +                                                
            'void main() {\n'                                   +
            '   gl_FragColor = color;'                          +
            '}\n'                                               ;

        var primitiveShader     = renderer.compileShaderProgram(primitiveVertexShaderSource, primitiveFragmentShaderSource);
        var positionAttr        = gl.getAttribLocation(primitiveShader, 'position');
        var cameraTransformUni  = gl.getUniformLocation(primitiveShader, 'cameraTransform');
        var objectTransformUni  = gl.getUniformLocation(primitiveShader, 'objectTransform');
        var samplerUni          = gl.getUniformLocation(primitiveShader, 'shader');
        var marginUni           = gl.getUniformLocation(primitiveShader, 'margin');
        var colorUni            = gl.getUniformLocation(primitiveShader, 'color');

        var vertexBuffer        = gl.createBuffer();

        return (item: RenderQueueItem) => {
            var cameraId    = item.intValues[0];
            var numPoints   = item.intValues[1];
            gl.useProgram(primitiveShader);

            gl.uniform1i(samplerUni, 0);
            
            // Generate the vertices
            var colorArray      = item.floatValues.subarray(0, 4);
            var transformArray  = item.floatValues.subarray(4, 20);
            var vertexArray     = item.floatValues.subarray(21, 21+numPoints*2);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
            
            gl.vertexAttribPointer(positionAttr, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionAttr);
            
            gl.uniformMatrix4fv(cameraTransformUni, false, renderer.cameraMatrix[cameraId]);
            gl.uniformMatrix4fv(objectTransformUni, false, transformArray);
            gl.uniform4fv(colorUni, colorArray);
            
            // Draw the texture with pre-multiplied alpha
            gl.enable(gl.BLEND);
            gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.lineWidth(1.0);

            gl.drawArrays(gl.LINES, 0, numPoints);
        };
    }

    webGlRenderAction[Actions.drawLine] = lineInit;
}