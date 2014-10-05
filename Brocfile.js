var compileTypeScript = require('broccoli-typescript'); 

var tameGame = 'TameGame';


var engine = compileTypeScript(tameGame, {
    out: 'TameGame.js',
    sourcemap: true,
    declaration: true
});

module.exports = engine ;
