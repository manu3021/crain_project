'use strict';

var gulp = require('gulp'),
    path = require('path'),
    autoprefixer = require('autoprefixer'),
    kss = require('kss'),
    loadPlugins = require('gulp-load-plugins')(),
    //browserSync = require('browser-sync').create(),
    fontAwesome = require('node-font-awesome');

var paths = {
  styles: {
    source: 'scss/',
    destination: 'css/'
  },
  scripts: 'js/',
  images: 'images/',
  styleGuide: 'styleguide',
  templates: 'templates/' 
};

// error notifications
var handleError = function (task) {
  return function (err) {
    loadPlugins.util.beep();

    loadPlugins.notify.onError({
      title: task + err.plugin,
      message: err.message,
      sound: true,
      icon: false
    })(err);

    loadPlugins.util.log(loadPlugins.util.colors.bgRed(task + ' error:'), loadPlugins.util.colors.red(err));
    this.emit('end');
  };
};

// Task for the browserSync
// gulp.task('browserSync', function() {
//   //watch files
//   loadPlugins.util.log(loadPlugins.util.colors.yellow('BrowserSync starting'));
//   var files = [
//     paths.styles.destination + '**/*.css',
//     paths.scripts + '**/*.js',
//     paths.images + '**/*',
//     paths.templates + '**/*.twig'
//   ];
//   browserSync.init({
//     files: files,
//     injectChanges: true,
//     proxy: "local",
//     online: true
//   });
// });

//Task to compile the sass, linting, sourcemaps
gulp.task('sass', function() {
  loadPlugins.util.log(loadPlugins.util.colors.yellow('Compiling the theme CSS!'));
  var plugins = [
    autoprefixer({browsers: ['last 4 version']})
  ];
  const SASS_INCLUDE_PATHS = [
    path.join(__dirname, '/node_modules/susy/sass'),
    fontAwesome.scssPath
  ];
  return gulp.src(paths.styles.source + '**/*.scss')
  .pipe(loadPlugins.plumber({errorHandler: handleError('Gulp Error in')}))
  .pipe(loadPlugins.sassGlob())
  .pipe(loadPlugins.scssLint())
  .pipe(loadPlugins.sourcemaps.init({loadMaps: true}))
  .pipe(loadPlugins.sass({
    includePaths: SASS_INCLUDE_PATHS
  })) // Converts Sass to CSS with gulp-sass
  .pipe(loadPlugins.postcss(plugins))
  .pipe(loadPlugins.sourcemaps.write('.'))
  .pipe(gulp.dest(paths.styles.destination))
});

// Task to lint the JS
// gulp.task('lint', function () {
//   loadPlugins.util.log(loadPlugins.util.colors.yellow('Reviewing JavaScript files!'));
//   return gulp.src([paths.scripts + 'script.js','!node_modules/**'])
//   .pipe(loadPlugins.eslint())
//   .pipe(loadPlugins.eslint.format())
//   .pipe(loadPlugins.eslint.failAfterError().on('error',loadPlugins.util.log))
//   .pipe(loadPlugins.uglify())
//   .pipe(gulp.dest(paths.scripts))
//   .pipe(browserSync.reload({
//     stream: true
//   }))
// });

// Task to optimize the images
gulp.task('images', function(){
  loadPlugins.util.log(loadPlugins.util.colors.yellow('Optimizing images!'));
  return gulp.src(paths.images + '**/*.+(png|jpg|gif|svg)')
  .pipe(loadPlugins.cache(loadPlugins.imagemin()))
  .pipe(gulp.dest(paths.images))
});

// Task to generate the styleguide
gulp.task('styleguide', function(){
  var css = [
    '../css/style.css',
    '../css/styleguide.css'
  ];
  return kss({
    title: 'Core theme Styleguide',
    source: paths.styles.source,
    destination: paths.styleGuide,
    homepage: 'README.md',
    css: css
    });
});

// Watch Task
gulp.task('watch', ['sass'], function (){
  gulp.watch(paths.styles.source + '**/*.scss', ['sass']);
  gulp.watch(paths.scripts + '**/*.js', ['lint']);
  gulp.watch(paths.templates + '**/*.twig');
})

// Task to test the CSS
gulp.task('css:test', function(){
  return gulp.src(paths.styles.destination + '*.css')
  .pipe(loadPlugins.parker());
});
