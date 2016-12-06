const gulp = require('gulp');

// const rename = require('gulp-rename');

const fs = require('fs');

const plumber = require('gulp-plumber');

const electron = require('electron-connect').server.create({
  path: './app/',
  stopOnClose: true,
});

const babel = require('gulp-babel');

const sourcemaps = require('gulp-sourcemaps');

const debug = require('gulp-debug');

// Compile Elm to JavaScript
const elm = require('gulp-elm');

gulp.task('elm-init', elm.init);
gulp.task('elm', ['elm-init'], () =>
  gulp.src('gui/elm/Content.elm')
    .pipe(plumber())
    .pipe(elm({ filetype: 'js' }))
    .on('error', (err) => {
      console.error(err.message);

      // Save the error to index.html, with a simple HTML wrapper
      // so browserSync can inject itself in.
      fs.writeFileSync('app/gui/index.html',
        `<!DOCTYPE HTML><html><body><pre>${err.message}</pre></body></html>`);

      // No need to continue processing.
      this.emit('end');
    })
    .pipe(babel())
    .pipe(gulp.dest('app/gui/page/')));
/**/

// Compiles the SCSS files into CSS
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');

gulp.task('style', () =>
  // Looks at the style.scss file for what to include and creates a style.css file
  gulp.src('gui/style/style.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['gui/style'],
    }))
    .on('error', (err) => {
      console.error(err.message);

      // Save the error to index.html, with a simple HTML wrapper
      // so browserSync can inject itself in.
      fs.writeFileSync('app/gui/index.html',
        `<!DOCTYPE HTML><html><body><pre>${err.message}</pre></body></html>`);

      // No need to continue processing.
      this.emit('end');
    })
    // AutoPrefix CSS files to work on Electron
    // We don't target all browsers, just the ones we need (Electron uses Chromium 53)
    .pipe(autoprefixer('Chrome >= 50', { cascade: true }))
    // Minify file for reduced size
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    // Directory your CSS file goes to
    .pipe(gulp.dest('app/gui/style/')));

// Copy other important files
gulp.task('copy:font', () =>
  gulp.src('gui/font/*')
    .pipe(gulp.dest('app/gui/font')));

gulp.task('copy:image', () =>
  gulp.src('gui/image/*')
    .pipe(gulp.dest('app/gui/image')));

gulp.task('copy:html', () =>
  gulp.src('gui/index.html')
    .pipe(gulp.dest('app/gui')));

// Minify all JS files
gulp.task('js:script', () =>
  gulp.src('gui/script/*.js')
    .pipe(debug())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/gui/script/')));

gulp.task('js:app', () =>
  gulp.src('main/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/')));

const jeditor = require('gulp-json-editor');

gulp.task('json', () =>
  gulp.src('package.json')
    .pipe(jeditor((arg) => {
      const json = Object.assign({}, arg);

      json.devDependencies = undefined;
      json.elmDeps = undefined;
      json.scripts = undefined;
      json.babel = undefined;
      json.build = undefined;
      json.dependencies = {};
      json.dependencies['electron-auto-updater'] = '^0.6.2';

      return json;
    }))
    .pipe(gulp.dest('app/')));

const install = require('gulp-install');

gulp.task('dependencies', ['json'], () =>
  gulp.src('app/package.json')
    .pipe(install()));

gulp.task('js', ['js:script', 'js:app']);
gulp.task('copy', ['copy:font', 'copy:image', 'copy:html']);

gulp.task('build', ['dependencies', 'copy', 'style', 'js', 'elm']);

gulp.task('reload:json', ['dependencies'], electron.restart);
gulp.task('reload:font', ['copy:font'], electron.restart);
gulp.task('reload:image', ['copy:image'], electron.restart);
gulp.task('reload:html', ['copy:html'], electron.restart);
gulp.task('reload:script', ['js:script'], electron.restart);
gulp.task('reload:app', ['js:app'], electron.restart);

// This two can error
gulp.task('reload:style', ['style', 'copy:html'], electron.restart);
gulp.task('reload:elm', ['elm', 'copy:html'], electron.restart);

gulp.task('default', ['build'], () => {
  // Start browser process
  electron.start();

  // Reload browser process
  gulp.watch('package.json', ['reload:json']);
  gulp.watch('gui/fonts/*', ['reload:font']);
  gulp.watch('gui/images/*', ['reload:image']);
  gulp.watch('gui/index.html', ['reload:html']);
  gulp.watch('gui/style/**', ['reload:style']);
  gulp.watch('gui/*.js', ['reload:script']);
  gulp.watch('gui/elm/*.elm', ['reload:elm']);
  gulp.watch('main/*.js', ['reload:app']);
});
