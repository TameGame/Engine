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
var path            = require('path');
var highlight       = require('highlight.js');

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

var allSections     = {};
var orderedSections = [];
var sectionOrder    = [ 'Introduction', 'Guides', 'Examples', 'Contact' ];

// Fills up the allSections array with a list of the sections and pages found in the markdown files
gulp.task('doc.sections', function() {
    allSections     = {};
    orderedSections = [];

    var md              = gulp.src(['doc/content/**/*.md']);
    var noFrontMatter   = md.pipe(frontmatter({ 
        property: 'frontmatter', 
        remove: true 
    }));
    var compiled        = noFrontMatter.pipe(markdown());

    // Create an object with all the sections in it and attach to the files
    var withSections    = compiled.pipe((function() {
        var sections = allSections;

        return through.obj(function (file, enc, cb) {
            if (!sections[file.frontmatter.section]) {
                sections[file.frontmatter.section] = {};
            }

            // It so happens the file.history[1] contains the filename but I don't know if that's how you're supposed to do it
            sections[file.frontmatter.section][file.frontmatter.title] = { name: path.basename(file.history[1]), order: file.frontmatter.order };

            file.sections = { allSections: sections, orderedSections: orderedSections, firstPage: {} };
            this.push(file);
            cb();
        }, function (cb) {
            orderedSections = Object.keys(allSections);
            orderedSections.sort();

            cb();
        });
    })());

    return withSections;
});

// Produces the HTML from the documentation content
gulp.task('doc.markdown', ['doc.sections'], function() {
    var md              = gulp.src(['doc/content/**/*.md']);
    var noFrontMatter   = md.pipe(frontmatter({ 
        property: 'frontmatter', 
        remove: true 
    }));
    var compiled        = noFrontMatter.pipe(markdown({ 
        highlight: function (code, lang, callback) {
            var langList    = null;
            if (lang) {
                langList = [ lang ];
            }

            var highlighted = highlight.highlightAuto(code, langList);
            callback(null, highlighted.value);
        }
    }));

    // Attach the allSections object to the files
    var withSections    = compiled.pipe(through.obj(function (file, enc, cb) {
        file.sections = { allSections: allSections, firstPage: {} }

        this.push(file);
        cb();
    }));

    // Attach an object with the ordered page data in it
    var withPages   = withSections.pipe(through.obj(function (file, enc, cb) {
        var allSections = file.sections.allSections;
        var sectionPages = allSections[file.frontmatter.section];

        file.sections.pages = Object.keys(sectionPages);
        file.sections.pages.sort(function (a, b) {
            return sectionPages[a].order - sectionPages[b].order;
        });

        file.sections.firstPage[file.frontmatter.section] = sectionPages[file.sections.pages[0]].name;

        this.push(file);
        cb();
    }, function(cb) {
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
    css                 = gulpMerge(css, gulp.src('node_modules/highlight.js/styles/default.css'));
    var images          = gulp.src(['doc/images/**/*']);

    return merge([
        wrapped.pipe(gulp.dest('build/doc')),
        css.pipe(gulp.dest('build/doc')),
        images.pipe(gulp.dest('build/doc'))
    ]);
});

// Creates the reference documentation from the source files
gulp.task('doc.reference', ['build.engine'], function () {
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

// Builds the engine, placing it in build/dist
gulp.task('build.engine', function () {
    // Build TameGame.js
    var engineTs        = gulp.src([ 'TameGame/**/*.ts', 'ThirdParty/**/*.d.ts' ]);
    var compiledEngine  = engineTs.pipe(ts(engineTsProject));

    var definitionFiles = gulpMerge(gulp.src([ 'ThirdParty/**/*.d.ts', 'TameGame/**/*.d.ts' ]), compiledEngine.dts);

    // Build the launcher (TameLaunch.js)
    var launchTs        = gulpMerge(gulp.src([ 'TameLaunch/**/*.ts' ]), definitionFiles);
    var compiledLaunch  = launchTs.pipe(ts(launchTsProject));

    // Merge in the required dependencies
    var p2js    = gulp.src('ThirdParty/p2.js/build/**/*');

    return merge([
        compiledEngine.js.pipe(gulp.dest('build/dist')),
        compiledEngine.dts.pipe(gulp.dest('build/dist')),
        compiledLaunch.js.pipe(gulp.dest('build/dist')),
        compiledLaunch.dts.pipe(gulp.dest('build/dist')),
        p2js.pipe(gulp.dest('build/dist'))
    ]);
});

// Builds the demos, placing the result in build/Demos
gulp.task('build.demos', [ 'build.engine' ], function() {
    var engine = gulp.src('build/dist/**/*.js');
    var definitionFiles = gulpMerge(gulp.src([ 'ThirdParty/**/*.d.ts', 'TameGame/**/*.d.ts', 'build/dist/**/*.d.ts' ]));

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

    return merge([
        demoBounce.pipe(gulp.dest('build/Demos/Bounce'))
    ]);
});

// Builds the tests, placing the result in build/Test
gulp.task('build.tests', [ 'build.engine' ], function() {
    var engine = gulp.src('build/dist/**/*.js');

    // Build the tests
    var tests   = gulpMerge(gulp.src('Test/**/*'), engine);

    return tests.pipe(gulp.dest('build/Test'));
});

// The build task builds the engine, tests and demos
gulp.task('build', [ 'build.engine', 'build.demos', 'build.tests' ]);

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
gulp.task('default', [ 'build', 'doc' ]);
