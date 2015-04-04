var gulp            = require('gulp');
var merge           = require('merge2');
var gulpMerge       = require('gulp-merge');
var ts              = require('gulp-typescript');
var connect         = require('gulp-connect');
var markdown        = require('gulp-markdown');
var typedoc         = require('gulp-typedoc');
var applyTemplate   = require('gulp-apply-template');
var frontmatter     = require('gulp-front-matter');
var through         = require('through2');

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

// Produces the HTML from the documentation content
gulp.task('doc.markdown', function() {
    var md              = gulp.src(['doc/content/**/*.md']);
    var noFrontMatter   = md.pipe(frontmatter({ 
        property: 'frontmatter', 
        remove: true 
    }));
    var compiled        = noFrontMatter.pipe(markdown());

    // Create an object with all the sections in it and attach to the files
    var withSections    = compiled.pipe((function() {
        var sections        = {};

        return through.obj(function (file, enc, cb) {
            if (!sections[file.frontmatter.section]) {
                sections[file.frontmatter.section] = {};
            }

            sections[file.frontmatter.section][file.frontmatter.title] = { name: file.name, order: file.frontmatter.order };

            file.sections = { allSections: sections };
            this.push(file);
            cb();
        }, function (cb) {
            cb()
        });
    })());

    // Attach an object with the ordered page data in it
    var withPages   = withSections.pipe(through.obj(function (file, enc, cb) {
        var allSections = file.sections.allSections;
        var sectionPages = allSections[file.frontmatter.section];

        file.sections.pages = Object.keys(sectionPages);
        file.sections.pages.sort(function (a, b) {
            return sectionPages[a].order - sectionPages[b].order;
        });

        this.push(file);
        cb();
    }));

    var wrapped         = withPages.pipe(applyTemplate({ 
        engine: 'lodash', 
        template: 'doc/templates/doc.lodash.html',
        props: [ 'contents', 'data' ],
        context: function(file) {
            return {
                data: { frontmatter: file.frontmatter, sections: file.sections },
            };
        }
    }));
    var css             = gulp.src(['doc/templates/*.css']);

    var combined        = gulpMerge(wrapped, css);

    return combined.pipe(gulp.dest('build/doc')).pipe(connect.reload());
});

gulp.task('doc.reference', ['build'], function () {
    var engineTs    = gulp.src([ 'build/dist/TameGame.d.ts', 'build/dist/TameLaunch.d.ts' ]);
    var docs        = engineTs.pipe(typedoc({
        module: 'amd',
        out: 'build/doc/reference',
        name: 'TameGame',
        target: 'es5',
        includeDeclarations: true
    }));

    return docs;
});

// Creates the documentation
gulp.task('doc', ['doc.markdown', 'doc.reference']);

// The build task builds the engine, tests and demos
// As the engine is copied into the tests and demos and gulp can't re-use the results of a task, we do this
// monolithically rather than with independent tasks.
gulp.task('build', function() {
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
        tests.pipe(gulp.dest('build/Test')),
        demoBounce.pipe(gulp.dest('build/Demos/Bounce'))
    ]);
});

// Watches and rebuilds
// FSEvents are broken on OS X so this often just errors out: one fix is to quit your editor (Sublime Text, for example) before starting gulp
gulp.task('watch', function () {
    // Gulp can't pipe tasks into other tasks so we can't rebuild things individually without rebuilding the engine multiple times: just watch everything
    gulp.watch([ 'TameGame/**/*.ts', 'TameLaunch/**/*.ts', 'Demos/**/*' ], [ 'build' ]);
    gulp.watch([ 'doc/**/*' ], [ 'doc.markdown' ]);
});

// Runs a server for the build result
gulp.task('connect', function () {
    connect.server({
        root: [ 'build' ],
        port: 4200,
        liveReload: true
    })
});

// Builds and serves the result
gulp.task('serve', [ 'build', 'watch', 'doc', 'connect' ]);

// Gulp uses FSEvents on OS X which are broken so allow serving without watching to make it possible to at least build the thing
// This issue: https://github.com/joyent/node/issues/5463 - it's closed. It's still broken. Great.
gulp.task('serveNoWatch', [ 'build', 'connect' ]);                  // Using gulp watch often results in ERROR: f2d_register_rpc() => (null) for me regardless of how many files are watched

// Default is just to build
gulp.task('default', [ 'build' ]);
