//=======================================================
// Configurations & Options
//=======================================================
var configGulp = require('./gulp.config')();

//=======================================================
// Declaration node modules
//=======================================================
var gulp        = require('gulp');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var sourcemaps  = require('gulp-sourcemaps');
var sassLint    = require('gulp-sass-lint');
var eslint      = require('gulp-eslint');
var babel       = require('gulp-babel');
var rename      = require('gulp-rename');
var imagemin    = require('gulp-imagemin');
var concat      = require('gulp-concat');
var gfile       = require('gulp-file');
var replace     = require('gulp-replace');
var insert      = require('gulp-insert');
var inject      = require('gulp-inject');
var notify      = require('gulp-notify');
var plumber     = require('gulp-plumber');
var watch       = require('gulp-watch');
var del         = require('del');
var runSequence = require('run-sequence');
var kss         = require('kss');
var fs          = require('fs');
var path        = require('path');
var wiredep     = require('wiredep').stream;
var notifier    = require('node-notifier');
var _           = require('lodash');
var sassGlob = require('gulp-sass-glob');

//=======================================================
// Main Tasks
//=======================================================
gulp.task('default', function(doneCallback) {
  runSequence(
    'build',
    function() {
      notifyDoneTasks();
      doneCallback();
    }
  );
});

gulp.task('serve', function(doneCallback) {
  runSequence(
    'build',
    'watch',
    function() {
      notifyDoneTasks();
      doneCallback();
    }
  );
});

gulp.task('build', function(doneCallback) {
  runSequence(
    'clean',
    'build:all',
    ['lint', 'copy:assets', 'build:kss-styleguide'],
    function() {
      notifyDoneTasks();
      doneCallback();
    }
  );
});

gulp.task('build-prod', function() {
  runSequence(
    'clean',
    'build:all',
    ['lint', 'compress:assets'],
    notifyDoneTasks
  );
});

gulp.task('build:all', [
  'compile:sass',
  'transpile:common'
]);

//=======================================================
// Watch
//=======================================================
gulp.task('watch', function() {
  var listAllCSS = [];
  listAllCSS.push(configGulp.globs.scss.all, configGulp.globs.css.all);

  watch(configGulp.globs.js.all, function() {
    runSequence(['lint:js', 'compile:js'], notifyRunningTasks);
  });

  watch(listAllCSS, function() {
    runSequence(['lint:sass', 'compile:sass'], notifyRunningTasks);
  });

  watch(configGulp.globs.js.all, function() {
    runSequence(['lint:js', 'compile:js'], notifyRunningTasks);
  });

  watch([
    configGulp.globs.twig.all,
    configGulp.globs.json.all,
    './style-guide/builder/kss-assets/kss.css'
  ], function() {
    runSequence(['clean:kss-styleguide', 'build:kss-styleguide'], notifyRunningTasks);
  });
});

//=======================================================
// Compile
//=======================================================
gulp.task('compile:sass', function() {
  return gulp.src(configGulp.globs.scss.all)
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sass({
      outputStyle: 'nested'
    })
    .on('error', sass.logError))
    .pipe(prefix({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(rename(function (path) {
      path.dirname = '';
      return path;
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('transpile:components', function() {
  return gulp.src(configGulp.globs.js.components)
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(babel({
      presets: ['es2015'],
      compact: true
    }))
    .pipe(insert.append('\nif(typeof init == \'function\') { init(); }'))
    .pipe(rename(function (path) {
      path.dirname = '';
      return path;
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/scripts/cfr_modules'));
});

gulp.task('transpile:common', function() {
  return gulp.src(configGulp.globs.js.common)
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')}
    ))
    .pipe(babel({
      presets: ['es2015'],
      compact: true
    }))
    .pipe(concat('common.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'));
});


//=======================================================
// Lint
//=======================================================
gulp.task('lint', ['lint:sass', 'lint:js']);

gulp.task('lint:sass', function () {
  // [FS] NOTE: Configuration within .sass-lint.yml
  return gulp.src(configGulp.globs.scss.all)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(sassLint())
    .pipe(sassLint.format());
});

gulp.task('lint:js', function () {
  // [FS] NOTE: Configuration within .eslintrc
  return gulp.src([
    './src/components/**/*.js'
  ])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(eslint())
    .pipe(eslint.format());
});

//=======================================================
// Generate style guide
//=======================================================
gulp.task('compile:kss-styleguide', function() {
  return kss({
    source: [
      'src/components',
      'src/styles'
    ],
    destination: './dist/style-guide',
    builder: 'style-guide/builder',
    namespace: [
      'core_theme:' + __dirname + '/src/components/',
      'kss_utils:' + __dirname + '/gulp/templates/kss-utils/'
    ],
    'extend-drupal8': true,
    css: [
      path.relative(
        __dirname + '/style-guide/',
        __dirname + '/css/main.css'
      )
    ],
    js: [],
    homepage: 'style-guide.md',
    title: 'Style Guide For Crain'
  });
});

gulp.task('build:kss-styleguide', function(doneCallback) {
  runSequence(
    'compile:kss-styleguide',
    'inject:js:kss-styleguide',
    doneCallback
  );
});

gulp.task('compile:js', function(doneCallback) {
  runSequence(
    'transpile:common',
    'compile:kss-styleguide',
    'inject:js:kss-styleguide',
    doneCallback
  );
});

//=======================================================
// Copy, Preprocess, Compress, Injection Tasks
//=======================================================
gulp.task('inject:js:kss-styleguide', function() {
  return gulp.src('./dist/style-guide/**/*.html')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(wiredep(configGulp.optionsWiredep))
    .pipe(inject(gulp.src('./dist/{js,drupal-js-libraries}/*.js', {
      read: false
    }), {
      relative: true,
      quiet: true
    }))
    .pipe(gulp.dest('./dist/style-guide'));
});

gulp.task('copy:assets', function() {
  return gulp.src(configGulp.globs.assets.all)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(rename(renamingAssetsStrategy))
    .pipe(gulp.dest('./dist/assets'));
});

gulp.task('compress:assets', function() {
  return gulp.src(configGulp.globs.assets.imagesOnly)
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(rename(renamingAssetsStrategy))
    .pipe(gulp.dest('./dist/assets'));
});

//=======================================================
// Clean
//=======================================================
gulp.task('clean', function () {
  return del([
    './dist/*'
  ], {
    force: true
  });
});

gulp.task('clean:kss-styleguide', function () {
  return del([
    './dist/style-guide/*'
  ], {
    force: true
  });
});

//=======================================================
// Helpers & Utils
//=======================================================
function renamingAssetsStrategy(path) {
  if (_.includes(path, 'fonts')) {
    return path;
  }

  path.dirname = '';
  return path;
}

function notifyRunningTasks() {
  return notifier.notify({
    title: 'Watch',
    message: 'running tasks...'
  });
}

function notifyDoneTasks() {
  return notifier.notify({
    title: 'Build',
    message: 'Done'
  });
}
