var compileTypeScript   = require('broccoli-typescript');
var mergeTrees          = require('broccoli-merge-trees');
var uglifyJs            = require('broccoli-uglify-js');
var pickFiles           = require('broccoli-static-compiler');

// Location of the various files
var engine      = 'TameGame';
var launch      = 'TameLaunch';
var test        = 'Test';
var thirdParty  = 'ThirdParty';
var bounceDemo  = 'Demos/Bounce';

// 'ThirdParty' should end up in a folder called 'ThirdParty'
thirdParty = pickFiles(thirdParty, {
    srcDir:     '/',
    destDir:    '/ThirdParty'
});

// The engine will depend on the third party components
engine = mergeTrees([engine, thirdParty]);

// Compile the engine typescript
var engineJs = compileTypeScript(engine, {
    out: 'TameGame.js',
    sourcemap: true,
    declaration: true
});

// We'll need the definition files to compile some other bits
var engineDefinitions = pickFiles(engineJs, {
    srcDir:     '/',
    files:       ['**/*.d.ts'],
    destDir:    '/'
});

// Test just gets copied into the appropriate folder
test = pickFiles(test, {
    srcDir:     '/',
    destDir:    '/Test'
});

// The launcher requires the TameGame engine definition
launch = mergeTrees([launch, engineDefinitions]);

var tameLaunchJs = compileTypeScript(launch, {
    out: 'TameLaunch.js',
    sourcemap: true,
    declaration: true
});

// p2js comes from the thirdparty directory
var p2js = pickFiles(thirdParty, {
    srcDir:     '/ThirdParty/p2.js/build/',
    destDir:    '/'
})

// Create the demos
bounceDemo = mergeTrees([bounceDemo, engineDefinitions]);

var bounceJs = compileTypeScript(bounceDemo, {
    out: 'Bounce.js',
    sourcemap: true,
    declaration: true
});

var bounceSupport = pickFiles(bounceDemo, {
    srcDir: '/',
    files:  [ '**/*.html', '**/*.png' ],
    destDir: '/'
});

var completeBounceDemo = mergeTrees([bounceSupport, bounceJs, engineJs, p2js, tameLaunchJs]);
completeBounceDemo = pickFiles(completeBounceDemo, {
    srcDir: '/',
    destDir: '/Demos/Bounce'
});

// Minify the engine and launcher
var launchMinSource = pickFiles(tameLaunchJs, {
    srcDir: '/',
    destDir: '/min'
});
var engineMinSource = pickFiles(engineJs, {
    srcDir: '/',
    files: [ '**/*' ],
    destDir: '/min'
});
var minifySource = mergeTrees([launchMinSource, engineMinSource]);
var engineMinified = uglifyJs(minifySource, {
});

test = mergeTrees([test, pickFiles(p2js, { srcDir: '/', destDir: '/Test' }) ]);

module.exports = mergeTrees([ engineJs, p2js, engineMinified, tameLaunchJs, test, completeBounceDemo ]);
