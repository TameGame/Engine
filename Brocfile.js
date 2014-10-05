var compileTypeScript   = require('broccoli-typescript'); 
var mergeTrees          = require('broccoli-merge-trees');
var uglifyJs            = require('broccoli-uglify-js');
var pickFiles           = require('broccoli-static-compiler');

var tameGame    = 'TameGame';
var tameLaunch  = 'TameLaunch';

var engineTs = compileTypeScript(tameGame, {
    out: 'TameGame.js',
    sourcemap: true,
    declaration: true
});
engineTs = uglifyJs(engineTs, {
});

/*
var launcherAndEngine = mergeTrees([engineTs, tameLaunchTs]);
var tameLaunchTs = compileTypeScript(launcherAndEngine, {
    out: 'TameLaunch.js',
    sourcemap: true,
    declaration: true
});
*/

module.exports = engineTs, tameLaunchTs;
