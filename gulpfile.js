"use-strict"

var fs = require('fs');

var plumber = require("gulp-plumber");

var electron = require('electron-connect').server.create();

var sourcemaps = require("gulp-sourcemaps");

var uglify = require("gulp-uglify");

//Compile Elm to JavaScript
var elm = require("gulp-elm");

gulp.task('elm-init', elm.init);
gulp.task('elm', ['elm-init'], function(){
    return gulp.src('src/elm/Main.elm')
        .pipe(plumber())
        .pipe(elm({filetype: 'js'}))
        .on('error', function(err) {
            console.error(err.message);

            // Save the error to index.html, with a simple HTML wrapper
            // so browserSync can inject itself in.
            fs.writeFileSync('app/index.html', "<!DOCTYPE HTML><html><body><pre>" + err.message + "</pre></body></html>");

            // No need to continue processing.
            this.emit('end');
        })
        .pipe(uglify())
        .pipe(gulp.dest('app/script/'))
});

// Compiles the SCSS files into CSS
var sass         = require("gulp-sass");
var autiprefixer = require("gulp-autoprefixer");
var cssnano      = require("gulp-cssnano");

gulp.task("style", function () {
    // Looks at the style.scss file for what to include and creates a style.css file
    return gulp.src("src/style/style.scss")
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ["src/style"]
        }))
        .on('error', function(err){
            console.error(err.message);

            // Save the error to index.html, with a simple HTML wrapper
            // so browserSync can inject itself in.
            fs.writeFileSync('app/index.html', "<!DOCTYPE HTML><html><body><pre>" + err.message + "</pre></body></html>");

            // No need to continue processing.
            this.emit('end');
        })
        // AutoPrefix CSS files to work on Electron
        // We don't target all browsers, just the ones we need (Electron uses Chromium 53)
        .pipe(autoprefixer("Chrome >= 50", { cascade: true }))
        //Minify file for reduced size
        .pipe(cssnano())
        .pipe(sourcemaps.write('.'))
        // Directory your CSS file goes to
        .pipe(gulp.dest("app/style/"))
        // Injects the CSS changes to your browser since Jekyll doesn"t rebuild the CSS
});

//Copy other important files
gulp.task("copy:fonts", function () {
    return gulp.src("src/fonts/*")
        .pipe(gulp.dest("app/fonts"))
});
gulp.task("copy:images", function () {
    return gulp.src("src/images/*")
        .pipe(gulp.dest("app/images"))
});
gulp.task("copy:html", function () {
    return gulp.src("src/index.html")
        .pipe(gulp.dest("app/index.html"))
});

//Minify all JS files
gulp.task("js:script", function () {
    return gulp.src("src/script/*.js")
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("app/script/"))
});
gulp.task("js:app", function () {
    return gulp.src("main-electron.js")
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("app.js"))
});

gulp.task("js",   ["js:script", "js:app"]);
gulp.task("copy", ["copy:fonts", "copy:images", "copy:html"]);

gulp.task("build", ["copy", "style", "js", "elm"]);

gulp.task('default', ['build'], function() {
    // Start browser process
    electron.start();

    // Reload browser process
    gulp.watch("src/fonts/*",      gulp.series("copy:fonts" , electron.reload));
    gulp.watch("src/images/*",     gulp.series("copy:images", electron.reload));
    gulp.watch("src/index.html",   gulp.series("copy:html"  , electron.reload));
    gulp.watch('src/style/*.scss', gulp.series('style'      , electron.reload));
    gulp.watch('src/script/*.js',  gulp.series('js:script'  , electron.reload));
    gulp.watch('src/*.elm',        gulp.series('elm'        , electron.reload));

    // Restart browser process
    gulp.watch('main-electron.js', gulp.series("js:app", electron.restart));
});
