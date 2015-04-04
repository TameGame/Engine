var gulp    = require('gulp');
var merge   = require('merge2');
var ts      = require('gulp-typescript');

var engineTsProject = {
    declarationFiles: true,
    noExternalResolve: true
};

gulp.task('default', function() {
    var engineTs    = gulp.src([ 'TameGame/**/*.ts', 'ThirdParty/**/*.d.ts' ]);
    var p2js        = gulp.src('ThirdParty/p2.js/build/**/*')

    var engine      = engineTs.pipe(ts(engineTsProject));

    return engine.js.pipe(gulp.dest('build'));
});
