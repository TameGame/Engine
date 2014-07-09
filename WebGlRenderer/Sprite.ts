/// <reference path="renderer.ts" />

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
        
        var spriteShader = renderer.compileShaderProgram(spriteVertexShaderSource, spriteFragmentShaderSource);
        
        // Return the rendering function
        return (item: RenderQueueItem) => {
            // The item should be a sprite action item
            var spriteItem = <SpriteAction> item;
            
            console.log(spriteItem);
        };
    }
    
    webGlRenderAction[spriteActionName] = spriteInit;
}
