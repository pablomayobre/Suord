"use-strict"
var gulp = require("gulp");

var rename = require("gulp-rename");;

var fs = require("fs");

var plumber = require("gulp-plumber");

var electron = require("electron-connect").server.create({
    path: "./app/",
    stopOnClose: true
});

var babel = require("gulp-babel");

var sourcemaps = require("gulp-sourcemaps");

var debug = require("gulp-debug");

//Compile Elm to JavaScript
/*
var elm = require("gulp-elm");

gulp.task("elm-init", elm.init);
gulp.task("elm", ["elm-init"], function(){
    return gulp.src("src/elm/Main.elm")
        .pipe(plumber())
        .pipe(elm({filetype: "js"}))
        .on("error", function(err) {
            console.error(err.message);

            // Save the error to index.html, with a simple HTML wrapper
            // so browserSync can inject itself in.
            fs.writeFileSync("app/index.html", "<!DOCTYPE HTML><html><body><pre>" + err.message + "</pre></body></html>");

            // No need to continue processing.
            this.emit("end");
        })
        .pipe(babel())
        .pipe(gulp.dest("app/script/"))
});
*/

// Compiles the SCSS files into CSS
var sass         = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var cssnano      = require("gulp-cssnano");

gulp.task("style", function () {
    // Looks at the style.scss file for what to include and creates a style.css file
    return gulp.src("src/style/style.scss")
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ["src/style"]
        }))
        .on("error", function(err){
            console.error(err.message);

            // Save the error to index.html, with a simple HTML wrapper
            // so browserSync can inject itself in.
            fs.writeFileSync("app/index.html", "<!DOCTYPE HTML><html><body><pre>" + err.message + "</pre></body></html>");

            // No need to continue processing.
            this.emit("end");
        })
        // AutoPrefix CSS files to work on Electron
        // We don"t target all browsers, just the ones we need (Electron uses Chromium 53)
        .pipe(autoprefixer("Chrome >= 50", { cascade: true }))
        //Minify file for reduced size
        .pipe(cssnano())
        .pipe(sourcemaps.write("."))
        // Directory your CSS file goes to
        .pipe(gulp.dest("app/style/"))
        // Injects the CSS changes to your browser since Jekyll doesn"t rebuild the CSS
});

//Copy other important files
gulp.task("copy:font", function () {
    return gulp.src("src/font/*")
        .pipe(gulp.dest("app/font"))
});
gulp.task("copy:image", function () {
    return gulp.src("src/image/*")
        .pipe(gulp.dest("app/image"))
});
gulp.task("copy:html", function () {
    return gulp.src("src/index.html")
        .pipe(gulp.dest("app"))
});

//Minify all JS files
gulp.task("js:script", function () {
    return gulp.src("src/script/*.js")
        .pipe(debug())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("app/script/"))
});
gulp.task("js:app", function () {
    return gulp.src("app.js")
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("app/"))
});
gulp.task("js:modules", function () {
    return gulp.src("electron-modules/*.js")
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("app/electron-modules/"))
});

gulp.task("js",   ["js:script", "js:app", "js:modules"]);
gulp.task("copy", ["copy:font", "copy:image", "copy:html"]);

gulp.task("build", ["copy", "style", "js"/*, "elm"*/]);

gulp.task("reload:font",   ["copy:font" ], electron.restart);
gulp.task("reload:image",  ["copy:image"], electron.restart);
gulp.task("reload:html",   ["copy:html" ], electron.restart);
gulp.task("reload:script", ["js:script" ], electron.restart);
gulp.task("reload:app",    ["js:app"    ], electron.restart);
gulp.task("reload:modules",["js:modules"], electron.restart);

//This two can error
gulp.task("reload:style",  ["style", "copy:html"], electron.restart);
//gulp.task("reload:elm",    ["elm",   "copy:html"], electron.restart);

gulp.task("default", ["build"], function() {
    // Start browser process
    electron.start();

    // Reload browser process
    gulp.watch("src/fonts/*",           ["reload:font"  ]);
    gulp.watch("src/images/*",          ["reload:image" ]);
    gulp.watch("src/index.html",        ["reload:html"  ]);
    gulp.watch("src/style/**",          ["reload:style" ]);
    gulp.watch("src/script/*.js",       ["reload:script"]);
    //gulp.watch("src/*.elm",             ["reload:elm"   ]);
    gulp.watch("electron-modules/*.js", ["reload:modules"]);
    gulp.watch("app.js",                ["reload:app"   ]);
});
