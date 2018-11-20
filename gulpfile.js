var gulp = require('gulp');
var run = require('gulp-run-command').default;

gulp.task('build_backend', run('python ./freeze.py', {
    cwd: "./backend/"
}));

gulp.task('deploy', ['build_backend'], run('release.bat'));

gulp.task('start_client', run("npm start"));