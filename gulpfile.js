var pkg = require('./package');

var gulp = require('gulp');
var gutil = require('gulp-util');
var shell = require('gulp-shell');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var rjs = require('gulp-requirejs');

var NwBuilder = require('node-webkit-builder');

var minimist = require('minimist');

var platform = process.platform;
platform = /^win/.test(platform) ? 'win' : /^darwin/.test(platform) ? 'mac' : 'linux';

var arch = process.arch;
arch = /^32/.test(arch) ? '32' : '64';

var flags = {
  string: 'build',
  boolean: 'icon',
  default: { build: platform + arch, icon: false }
};

var options = minimist(process.argv.slice(2), flags);

var platforms;
if (options.build === "all") {
  platforms = ["osx", "linux", "win"];
} else {
  options.build = options.build.replace("mac", "osx");
  platforms = options.build.split(',');
}

var files = ['package.json', 'app/**', 'dist/**/*', 'index.html', '.desktop', 
'vendor/components/backbone/backbone-min.js', 'vendor/components/jquery/dist/jquery.min.js',
'vendor/components/underscore/underscore-min.js', 'vendor/components/backbone.marionette/lib/backbone.marionette.min.js',
'vendor/components/jquery-popup-overlay/jquery.popupoverlay.js', 
'vendor/components/backbone.localStorage/backbone.localStorage-min.js',
'vendor/components/moment/min/moment.min.js', 'node_modules/triejs/src/trie.min.js', 
'vendor/components/tab-complete/dist/jquery.tab-complete.min.js', 
'vendor/components/Autolinker.js/dist/Autolinker.min.js', 
'node_modules/irc/**/*', 'node_modules/node-uuid/**/*', 'node_modules/nw-notify/**/*', 
'vendor/components/requirejs/require.js'];

gulp.task('build', function() {
  var nw = new NwBuilder({
    appName: pkg.window.title,
    appVersion: pkg.version,
    buildDir: 'build',
    files: files,
    platforms: platforms,
    winIco: (options.icon || platform === 'win' ? './dist/images/chatter.ico' : null),
    version: '0.12.1',
    macCredits: 'credits.html'
  });

  nw.on('log', console.log);

  return nw.build().catch(console.log);
});

gulp.task('serve', ['compile'], shell.task(['node node_modules/nw/bin/nw . --debug']));


gulp.task('watch', function () {
  gulp.watch(['app/modules/**/*', 'app/styles/*.css', 'app/*'], ['compile']);
});


gulp.task('rjs', function() {
  rjs({
    mainConfigFile: "app/config.js",
    include: ["main"],
    out: "source.js",
    baseUrl: "app",
    wrap: true
  })
 .pipe(gulp.dest('./dist/js/'))
 .pipe(rename('source.min.js'))
 .pipe(uglify())
 .on('error', gutil.log)
 .pipe(gulp.dest('./dist/js/'));
});

gulp.task('uglify', ['rjs'], function() {
 gulp.src('dist/js/*.js')
 .pipe(rename('source.min.js'))
 .pipe(uglify())
 .on('error', console.warn)
 .pipe(gulp.dest('dist/js/'));
});

gulp.task('css', function () {
 gulp.src(['./app/styles/*.css'])
 .pipe(rename('app.css'))
 .pipe(minifyCSS())
 .on('error', console.warn)
 .pipe(gulp.dest('./dist/css/'));
});


gulp.task('fonts', function () {
 gulp.src(['./app/styles/fonts/**'], { "base" : "./app/styles/fonts/" })
 .on('error', console.warn)
 .pipe(gulp.dest('./dist/css/fonts/'));
});

gulp.task('images', function () {
 gulp.src(['./app/images/*'])
 .on('error', console.warn)
 .pipe(gulp.dest('./dist/images/'));
});

gulp.task('sounds', function () {
 gulp.src(['./app/sounds/*'])
 .on('error', console.warn)
 .pipe(gulp.dest('./dist/sounds/'));
});



gulp.task('all', ['rjs', 'css', 'fonts', 'images', 'sounds']);
gulp.task('compile', ['rjs', 'css', 'images', 'sounds']);
gulp.task('default', ['compile', 'serve', 'watch']);