var gulp = require('gulp'),
    uglify = require('gulp-uglifyjs'),
    concat = require('gulp-concat');

var scripts = [
    //'public/socket.io.js',
    'public/d3.v3.min.js',
    'public/topojson.v1.min.js',
    'src/**'
];

gulp.task('concat', function () {
    gulp.src(scripts)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/js'));
});

gulp.task('uglify', function () {
    gulp.src(scripts)
    .pipe(uglify())
    .pipe(gulp.dest('public/js'));
});

gulp.task('watch', function () {
    gulp.watch('src/**', ['concat']);
});

gulp.task('default', ['concat']);
