/**
 * Gulp Tulp - v1.0.0 
 * 
 * "TULP" is the Dutch translation for "tulip". The tulip is a peren-
 * nial, bulbous plant with showy flowers in the genus Tulipa, of 
 * which around 75 wildspecies are currently accepted[1] and which 
 * belongs to the family Liliaceae.
 *
 * Copyright (c) 2015 z3bbster. All rights reserved.
 * 
 * Redistribution and use in source and binary forms are permitted
 * provided that the above copyright notice and this paragraph are
 * duplicated in all such forms and that any documentation,
 * advertising materials, and other materials related to such
 * distribution and use acknowledge that the software was developed
 * by the z3bbster. The name of the
 * z3bbster may not be used to endorse or promote products derived
 * from this software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND WITHOUT ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 */

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

////////////////////////////
// LOAD REQUIRED PACKAGES //
////////////////////////////

// the glob to search for 
var pluginsPatterns = ['gulp-*', 'del', 'browser-sync'];

var gulp = require('gulp'),
    del = require('del'),
    browserSync = require('browser-sync'),
    plugins = require('gulp-load-plugins')(), // package.json
    psi = require('psi'),
    opn = require('opn'),
    htmlv = require('gulp-html-validator'),
    licenseFind = require('gulp-license-finder'),
    protractor = require('gulp-protractor').protractor, // Start a standalone server
    webdriver_standalone = require('gulp-protractor').webdriver_standalone, // Download and update the selenium driver
    webdriver_update = require('gulp-protractor').webdriver_update,
    reload = browserSync.reload,
    site = 'http://tcdoc.nl/test3/embed/',
    D = new Date(),
    d = D.getDay()+'-'+(D.getMonth() + 1)+'-'+D.getFullYear(),
    w = new Date().getWeek();

// All Gulp tasks from gulp folder
//require('require-dir')('./gulp'); 

////////////////////////
// PLUGINS REFERENCES //
////////////////////////
var util = plugins.util,
    templateCache = plugins.angularTemplatecache,
    size = plugins.filesize;

///////////////////////////
// DEFAULT PROJECT PATHS //
///////////////////////////
var paths = {
  index: 'app/index.html',
  templates: 'app/views/*.html',
  scripts: 'app/scripts/**/*',
  less: 'app/less/main.less',
  styles: 'app/css/**/*',
  assets: 'app/assets/**/*',
  fonts: 'app/assets/fonts/**/*',
  images: 'app/assets/img/**/*',
  jsons: ['./bower.json', './package.json'], // Update bower, npm at once
  zip: ['app/**/*', '!app/less/**', '!app/bower_components/**', 'gulpfile.js'],
  zip1: ['gulpfile.js','package.json', 'bower.json', 
          'app/scripts/*', 'app/styles/*','app/assets/**/*','app/views/*',
          '!app/less/', '!app/bower_components/', '!node_modules/','!dist/','!tmp/','!zips/','!dist/'],
  dist: 'dist/'
};

////////////////
// INIT PHASE //
////////////////
util.log( '=============================================================');
util.log( 
  util.colors.red('Gulp-tulp'), 
  util.colors.white('Webdev'), 
  util.colors.blue('Buildsystem') ,
  util.colors.yellow(' 20/01/2015 - V.0.0.1'));
util.log( '=============================================================');

//////////////////////
// BOWER GULP TASKS //
//////////////////////

// This will default 'install' all Bower packages from bower.json
gulp.task('bower', function() { 
  return plugins.bower(); 
});

// This will 'update' all local Bower packages in 
gulp.task('bower:update', function() { 
  return plugins.bower({ cmd: 'update'}); 
});


gulp.task('install', function() { 
  gulp.src(['./bower.json', './package.json'])
  .pipe(plugins.install());
});



//////////////////////////
// FILE COPY GULP TASKS //
//////////////////////////

// Copy all minified javascript files from bower_components to 
// build folder without relative paths
gulp.task('flatten', function () {
  gulp.src('./app/bower_components/**/*.min.js')
  .pipe(plugins.flatten())
  .pipe(gulp.dest('dist/js/vendors'));
});

gulp.task('copy:dist', function (cb) {
  gulp.src('./app/views/*')
  .pipe(gulp.dest('dist/views'));

  gulp.src('./app/data/*.json')
  .pipe(gulp.dest('dist/data'));
});

///////////////////////////////////////
// CLEANING & HOUSKEEPING GULP TASKS //
///////////////////////////////////////

// Clean the 'dist' folder
gulp.task('clean:dist', function (cb) {
  console.log('CLEAN:DIST TASK! Removed dist folder');
  del(['dist/**/*'], cb);
});

// Clean the 'tmp' folder
gulp.task('clean:tmp', function (cb) {
  del(['tmp'], cb);
});

// Clean the 'tmp' folder
gulp.task('clean:docs', function (cb) {
  del(['documentation'], cb);
});


////////////////////////
// VERSION BUMP TASKS //
////////////////////////

// Synchronize version, name, description, keywords... in each config file (package.json, bower.json, component.js...).
gulp.task('sync', function() {
  gulp.src(['bower.json', 'component.json'])
    .pipe(plugins.configSync())
    .pipe(gulp.dest('.')); // write it to the same dir 
});

gulp.task('bump', function(){
  gulp.src(paths.jsons)
    .pipe( plugins.bump())
    .on('error', function(err) { gutil.log(err.message); })
    .pipe(gulp.dest('./'))
    .pipe(size());
});

gulp.task('bump:minor', function(){
  gulp.src(paths.jsons)
    .pipe( plugins.bump({type:'minor'}))
    .on('error', function(err) { gutil.log(err.message); })
    .pipe(gulp.dest('./'))
    .pipe(size());
});

gulp.task('bump:major', function(){
  gulp.src(paths.jsons)
    .pipe( plugins.bump({type:'major'}))
    .on('error', function(err) { gutil.log(err.message); })
    .pipe(gulp.dest('./'))
    .pipe(size());
});

gulp.task('bump:init', function(){
  gulp.src(paths.jsons)
    .pipe( plugins.bump({version: '0.0.0'}))
    .on('error', function(err) { util.log(err.message); })
    .pipe(gulp.dest('./'))
    .pipe(size());
});


/////////////////////////////
// ANGULARJS RELATED TASKS //
/////////////////////////////

gulp.task('ng-templates', function() {
  // Concatenates and registers AngularJS templates in the $templateCache.
  gulp.src( paths.templates )
    .pipe(plugins.changed(paths.dist))
    /*.pipe( plugins.confirm({
      question: 'You want to generate $templateCache. Continue?',
      continue: function(answer) {
        return answer.toLowerCase() === 'y';
      }
    }))*/
    .pipe( templateCache() )
    .on('error', function(err) { util.log(err.message); })
    .pipe( gulp.dest(paths.dist + 'scripts') )
    .pipe(size());
});

gulp.task('ngmin', function () {
    return gulp.src('app/scripts/app.js')
        .pipe(plugins.changed(paths.dist))
        .pipe(plugins.ngAnnotate({dynamic: true, remove: false, single_quotes: true}))
        .on('error', function(err) { util.log(err.message); })
        .pipe(gulp.dest('app/scripts/'))
        .pipe(size());
});

/////////////////////////
// OPTIMIZE GULP TASKS //
/////////////////////////

// {benchmark: true, debug: true}
// {empty: true, cdata: true, comments: false, conditionals: true, spare: false, quotes: true }
// {mangle: false, preserveComments: 'some', compression: {warnings: true},  }

// The main 'useref' gulp task
gulp.task('useref',['clean:dist'], function () {
    var assets = plugins.useref.assets();

    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(plugins.if('*.js', plugins.uglify({mangle: false, output: { beautify: false}, preserveComments: 'some' }) ))
        .pipe(plugins.if('*.css', plugins.minifyCss() ))
        .pipe(plugins.rev()) // rev the *.js and *.css file
        .pipe(assets.restore())
        .pipe(plugins.useref())
        .pipe(plugins.revReplace()) // revReplace the links and scripts in HTML
        .on('error', function(err) { util.log(err.message); })
        .pipe(gulp.dest('dist'));
});

gulp.task('compress', function() {
  gulp.src('app/scripts/*.js')
    .pipe(plugins.uglify())
    .pipe(plugins.stripDebug())
    .pipe(plugins.concat('all.js'))
    .pipe(gulp.dest('dist/js/'))
});

gulp.task('imagemin', function () {
  var svgoSettings = 
  gulp.src(paths.assets)
    .pipe(reload({stream: true, once: true}))
    // Pass in options to the task
    .pipe( plugins.cached(plugins.imagemin({
      optimizationLevel: 5,   //PNG level 0/7
      progressive: true,      //JPG
      interlaced: false,      //GIF
      svgoPlugins: [          //SVG
        { removeViewBox: false }, 
        { removeEmptyAttrs: false },
        { removeDoctype: false }, 
        { removeComments: false },
        { removeEmptyContainers: false },
      ],  
      use: []
    })))
    .pipe(size())
    .on('error', function(err) { gutil.log(err.message); })
    .pipe(gulp.dest('dist/assets/'));
});

// Validate HTML
gulp.task('validate:html', function () {
  gulp.src('app/invalid.html')
    .pipe(htmlv())
    .pipe(gulp.dest('./dist'));
});

gulp.task('cdnizer', function() {
gulp.src("./app/index.html")
        .pipe(plugins.cdnizer([
          {
            file: 'bower_components/angular/*.js',
            package: 'angular',
            test: 'window.angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ version }/${ filenameMin }'
          },
          {
            file: 'bower_components/angular-*/*.js',
            package: 'angular',
            test: 'window.angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ version }/${ filenameMin }'
          },
          {
            file: 'bower_components/jquery/dist/jquery.min.js',
            package: 'jquery',
            test: 'window.jquery',
            // use alternate providers easily
            cdn: '//ajax.googleapis.com/ajax/libs/jquery/${ version }/jquery.min.js'
          },
        ]))
        .pipe(gulp.dest("./dist"));
});

//////////////////////////////
// PREPROCCESSOR GULP TASKS //
//////////////////////////////

gulp.task('less', function() {
  gulp.src([paths.less] ) // {base: "./app/less"}
    .pipe( plugins.less())
    //.pipe( plugins.license('BSD2', {tiny: false, organization: 'Technische Centrale'}))
    .on('error', function(err) { gutil.log(err.message); })
    .pipe(gulp.dest('app/styles'))
    .pipe(reload({stream: true, once: true}))
    .pipe(size());
});

gulp.task('jshint', function () {
    util.log( '=============================================================');
  util.log( util.colors.green('JSHINT JavaScript Code Quality Tool') );
  util.log( '=============================================================');
  gulp.src([paths.scripts])
    .pipe(reload({stream: true, once: true}))
    .pipe(plugins.jshint({enforceall: false}))
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.if(!browserSync.active, plugins.jshint.reporter('fail')))
    .on('error', function(err) { gutil.log(err.message); });
});


////////////////////////
// TESTING GULP TASKS //
////////////////////////


// Download and update the selenium driver
gulp.task('webdriver_update', webdriver_update);

// Start a standalone server
gulp.task('webdriver_standalone', webdriver_standalone);

// Setting up the protractor test task
gulp.task('protractor', function () {
  gulp.src(["./src/app/js/tests/*.js"])
    .pipe(protractor({
        configFile: "test/protractor.config.js",
        args: ['--baseUrl', 'http://127.0.0.1:8000']
    })) 
    //.on('error', function(e) { throw e })
    .on('error', function(err) { gutil.log(err.message); });
});

////////////////////////
// GENERAL GULP TASKS //
////////////////////////
//Hogan template injector
gulp.task('hogan', function(){
  gulp.src('templates/template.hogan')
    .pipe(plugins.hogan({handle: 'gnumanth'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('licenses:check', function() {
  var settings = {
            directory: '/app/bower_components/',
            production: true,
            depth: 5,
            csv: true
        }
    return licenseFind('licenses.txt')
        .pipe(gulp.dest('./tmp/audit'))
});

gulp.task('markdown', function () {
    return gulp.src('./README.md')
        .pipe(plugins.markdown())
        .pipe(gulp.dest('dist'));
});

gulp.task('menu', function () {
    plugins.menu(this);
});
////////////////////
// GIT GULP TASKS //
////////////////////
gulp.task('git:init', function(){
  // git init n root 
  plugins.git.init(function (err) {
    if (err) throw err;
  });
});

gulp.task('git:add', function(){
  // git add . all file except .gitignore
  gulp.src('./*')
      .pipe(plugins.git.add());
});

gulp.task('git:commit', function(){
  // First commit
  gulp.src('./')
    .pipe(plugins.git.commit('initial commit'));
});

gulp.task('git:remote', function(){
  plugins.git.addRemote('origin', 'https://github.com/tcdevs/zgbs', function (err) {
    if (err) throw err;
  });
});

gulp.task('git:push', function(){
  plugins.git.push('origin', 'master', function (err) {
    if (err) throw err;
  });
});

gulp.task('git:status', function(){
  plugins.git.status({args: '--porcelain'}, function (err, stdout) {
    if (err) throw err;
  });
});

///////////////////////
// DEPLOY GULP TASKS //
///////////////////////
gulp.task('deploy:ftp', function () {
  gulp.src('build/*')
    .pipe(ftp({
      host: 'website.com',
      user: 'johndoe',
      pass: '1234'
    }));
});

gulp.task('zip:src', function () {
  // { cwd: 'app/', base: true }
  gulp.src('app/**/*')
    .pipe(plugins.logger({
            before: 'Starting ZIP...',
            after: 'Gzipping complete!',
            extname: '.zip',
            showChange: true
        }))
    .pipe(plugins.zip('src-archive[' + d + '-W' + w + '].zip'))
    .pipe(gulp.dest('zips/src'));
});

gulp.task('zip:dist', function () {
  // { cwd: 'app/', base: true }
  gulp.src('dist/**/*')
    .pipe(plugins.zip('dist-archive[' + d + '-W' + w + '].zgulpip'))
    .pipe(gulp.dest('zips/dist'));
});

var jsdocDfg = {
    path            : "ink-docstrap",
    systemName      : "ZGBS",
    footer          : "Made with love by Jano Mijer",
    copyright       : "Technische Centrale",
    navType         : "horizontal",
    theme           : "Spacelab",
    linenums        : true,
    collapseSymbols : false,
    inverseNav      : false
  },
  jsdocOptions = {
    showPrivate: true,
    monospaceLinks: true,
    cleverLinks: true,
    outputSourceFiles: true
  };

gulp.task('jsdoc', ['clean:docs'], function() {
  gulp.src(["./app/scripts/*.js", "README.md"])
  .on('error', function(err) { gutil.log(err.message); })
  .pipe(plugins.jsdoc('./documentation', jsdocDfg))
  .pipe(size());
});

gulp.task('deploy:verkoop', function () {
  gulp.src(["./dist/**/*"], { dot: true})
  .pipe(gulp.dest('test3/UPLOAD'))
    .pipe(size({title: 'copy'}));
});

////////////////////////////
// BROWSERSYNC GULP TASKS //
////////////////////////////
gulp.task('server:dev', function() {
  // start DEVELOPMENT server
  browserSync({
    host: "localhost",
    port: 8080,
    logLevel: "debug", // debug/info/silent
    logConnections: false,
    logFileChanges: false,
    browser: ["google chrome"],
    logPrefix: "server:dev",
    server: {
      baseDir: "app"
    }
  });
});

gulp.task('server:build', function() {
  // start PRODUCTION server
  browserSync({
    host: "localhost",
    port: 8080,
    logLevel: "info", // debug/info/silent
    logConnections: false,
    logFileChanges: false,
    browser: ["google chrome"],//, "firefox", "internet explorer", "opera"
    logPrefix: "server:dist",
    server: {
      baseDir: "./dist"
    }
  });
});

//////////////////////
// REFERENCES TASKS //
//////////////////////
gulp.task('references', function () {
  gulp.src('app/index.html')
  .pipe( plugins.notify("Found file: <%= file.relative %>!"))
  .pipe( plugins.confirm({
      // Static text.
      question: 'Open references for AngularJS, Bootstrap 3+, Font Awesome 4.3+. Continue?',
      continue: function(answer) {

        // Check if answer is true
        if (answer.toLowerCase() === 'y') {
          opn('http://getbootstrap.com/css', 'chrome');
          opn('fortawesome.github.io/Font-Awesome/icons', 'chrome');
          opn('https://docs.angularjs.org/api', 'chrome');
        };
        return answer.toLowerCase() === 'y';
      },
    }))
});

///////////////////////////////////////////
// GLOBAL WATCH TASK FOR ALL FILE CHANGE //
///////////////////////////////////////////
gulp.task('watch', function() {
  browserSync.notify("Compiling, please wait!");
    // Watch all JS files
    gulp.watch(paths.scripts, [ 'jshint']);
    // Watch all assets images, SVGs, etc
    gulp.watch(paths.images, browserSync.reload );
    // Watch all html files incl. templates and views
    gulp.watch(paths.index, browserSync.reload  );
    // Watch less file
    gulp.watch('app/less/*.less', [ 'less' ]);

    
});

/////////////////////////////
// ALL THE MAIN GULP TASKS //
/////////////////////////////

// THE DEFAULT TASK (Dev environment)
gulp.task('default', ['server:dev', 'watch', 'references']);

// THE BUILD TASK
gulp.task('build', ['useref'], function () {
  gulp.start('imagemin');
  gulp.start('ng-templates');
  gulp.start('copy:dist');
});

// THE TEST TASK
gulp.task('test', []);

//THE DEPLOY TASK
gulp.task('deploy', [], function () {
  // Concatenates asset files from the build blocks inside the HTML
  // Appends hash to extracted files app.css → app-098f6bcd.css
  // Adds AngularJS dependency injection annotations
  // Uglifies js files
  // Minifies css files
  // Brings back the previously filtered HTML files
  // Parses build blocks in html to replace references to non-optimized scripts or stylesheets
  // Rewrites occurences of filenames which have been renamed by rev
  // Minifies html
  // Creates the actual files
  // Print the file sizes
});


// Run PageSpeed Insights Desktop Mode
gulp.task('pagespeed:desktop', function (cb) {
  util.log( '=============================================================');
  util.log( util.colors.green('PageSpeed Insights', 'Desktop Mode') );
  util.log( '=============================================================');
  psi.output( site, {
    strategy: 'desktop',
    nokey: 'true',
  }, cb);
});

// Run PageSpeed Insights Mobile Mode
gulp.task('pagespeed:mobile', function (cb) {
    util.log( '=============================================================');
  util.log( util.colors.green('PageSpeed Insights'), 'Mobile Mode' );
  util.log( '=============================================================');
  psi.output( site, {
    strategy: 'mobile',
    nokey: 'true',
  }, cb);
});