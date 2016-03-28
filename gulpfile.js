var gulp = require('gulp');
var mocha = require('gulp-mocha');
var util = require('gulp-util');

var source = "src/";
var dest = "build/";
var jsDir = source+"js/**/";
var jsFiles = jsDir+"*.js";
var testDir = "test/"

gulp.task('test', function () {
  util.log('TESTTESTTESTTESTTEST');
  return gulp.src([testDir+"**/*"], { read: false })
    .pipe(mocha({ reporter: 'spec' }))
    .on('error', util.log);
});

gulp.task('test-watch', ['test'], function () {
  gulp.watch([source+"**/*", testDir+"**/*", 'app.js'], ['test']);
});

gulp.task('start', function() {
  util.log('No app to run!');
  // App();
});
