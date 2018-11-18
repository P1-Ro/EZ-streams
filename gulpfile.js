var gulp = require('gulp');
var run = require('gulp-run-command').default

gulp.task('build_backend', run('python ./freeze.py', {
    cwd: "./backend/"
}));

gulp.task('deploy', ['build_backend'], run('release.bat'));

gulp.task('start_backend', run('pipenv run python app.py', {
    cwd: "./backend/"
}));
gulp.task('start_client', run("npm start"));
gulp.task('start', ['start_backend', 'start_client'] );