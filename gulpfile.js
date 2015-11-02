var gulp = require('gulp');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var srcDir = 'src';
var buildDir = 'dist';

gulp.task('default', ['build', 'watch']);

gulp.task('build', ['copy', 'bower', 'scripts']);

var copySources = [
   srcDir + '/client/favicon.png',
   srcDir + '/client/index.html',
   srcDir + '/client/css/**',
   srcDir + '/client/resources/**'
];
gulp.task('copy', function() {
   return gulp.src(copySources, {base: srcDir + '/client/'})
      .pipe(gulp.dest(buildDir + '/client'))
   ;
});

gulp.task('bower', function() {
   return gulp.src('bower_components/**', {base: './'})
      .pipe(gulp.dest(buildDir + '/client'))
   ;
});

gulp.task('scripts', function() {
   return gulp.src(srcDir + '/client/js/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(buildDir + '/client/js'))
   ;
});

gulp.task('clean', function(cb) {
   del([buildDir], cb);
});

gulp.task('watch', function() {
   gulp.watch(copySources, ['copy']);
   gulp.watch('bower_components/**', ['bower']);
   gulp.watch(srcDir + '/client/js/**/*.js', ['scripts']);
});
