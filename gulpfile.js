var gulp = require("gulp");
var exec = require("child_process").exec;
var jsdoc = require("gulp-jsdoc3");

gulp.task("typescript", function (callback) {
    exec("tsc", function (err) {
        if (err != null) {
            callback(err);
            return;
        }
        callback();
    });
});

gulp.task("webpack", ["typescript"], function (callback) {
    exec("webpack", function (err) {
        if (err != null) {
            callback(err);
            return;
        }
        callback();
    });
});

gulp.task("jsdoc", ["typescript", "webpack"], function (callback) {
    gulp.src(["./README.md", "./library/**/*.js"], { read: false }).pipe(jsdoc(callback));
});

gulp.task("default", ["webpack", "typescript", "jsdoc"]);