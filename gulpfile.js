'use strict';

const documentation = require('./tasks/documentation');
const instrument = require('./tasks/instrument');
const lint = require('./tasks/lint');
const test = require('./tasks/test');
const gulp = require('gulp');

gulp.task('cover', instrument);
gulp.task('docs', documentation);
gulp.task('lint', lint);
gulp.task('test', ['cover'], test);
gulp.task('default', ['docs', 'lint', 'test']);
