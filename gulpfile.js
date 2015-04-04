var gulp        = require('gulp');
var merge       = require('merge2');
var gulpMerge   = require('gulp-merge');
var ts          = require('gulp-typescript');

var engineTsProject = {
    out: 'TameGame.js',
    declarationFiles: true,
    noExternalResolve: true
};

var launchTsProject = {
    out: 'TameLaunch.js',
    declarationFiles: true,
    noExternalResolve: true
};

gulp.task('default', function() {
    // Build TameGame.js
    var engineTs        = gulp.src([ 'TameGame/**/*.ts', 'ThirdParty/**/*.d.ts' ]);
    var compiledEngine  = engineTs.pipe(ts(engineTsProject));

    var definitionFiles = gulpMerge(gulp.src([ 'ThirdParty/**/*.d.ts', 'TameGame/**/*.d.ts' ]), compiledEngine.dts);

    // Build the launcher (TameLaunch.js)
    var launchTs        = gulpMerge(gulp.src([ 'TameLaunch/**/*.ts' ]), definitionFiles);
    var compiledLaunch  = launchTs.pipe(ts(launchTsProject));

    // Merge in the required dependencies
    var p2js    = gulp.src('ThirdParty/p2.js/build/**/*');
    var engine  = gulpMerge(compiledEngine.js, compiledEngine.dts, compiledLaunch.js, compiledLaunch.dts, p2js);

    // Build the demos
    function buildDemo(directory, targetJsName) {
        // Typescript files get compiled
        var demoTs          = gulpMerge(gulp.src([ directory + '/**/*.ts' ]), definitionFiles);

        // Non typescript files get passed through
        var demoNoTs        = gulp.src([ directory + '/**/*', '!' + directory + '/**/*.ts' ]);

        // Compile the typescript files
        var compiledDemo    = demoTs.pipe(ts({ out: targetJsName, declarationFiles: false, noExternalResolve: true }));

        // Result is the non-ts files, the compiled result and the engine
        return gulpMerge(demoNoTs, compiledDemo.js, engine);
    }

    var demoBounce = buildDemo('Demos/Bounce', 'Bounce.js');

    // Build the tests
    var tests   = gulpMerge(gulp.src('Test/**/*'), engine);

    // Put everything together in the output directory
    return merge([
        engine.pipe(gulp.dest('build/dist')),
        tests.pipe(gulp.dest('build/Tests')),
        demoBounce.pipe(gulp.dest('build/Demos/Bounce'))
    ]);
});
