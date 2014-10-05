module.exports = function (broccoli) { 
    var compileTypeScript = require('broccoli-typescript');
    
    var tameGameTree = broccoli.makeTree('TameGame');
    
    var engine = compileTypeScript(tameGameTree, {
        out: 'TameGame.js',
        sourcemap: true,
        declaration: true
    });
        
    return [ engine ];
};
