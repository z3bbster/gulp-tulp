/**
 * Gulp Tulp  - v1.0.0 
 * 
 * "TULP" is the Dutch translation for "tulip". The tulip is a peren-
 * nial, bulbous plant with showy flowers in the genus Tulipa, of 
 * which around 75 wildspecies are currently accepted[1] and which 
 * belongs to the family Liliaceae.
 *
 * Copyright (c) 2015 z3bbster.
 * All rights reserved.

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

////////////////////////////
// LOAD REQUIRED PACKAGES //
////////////////////////////
var gulp 		    = require('gulp'),
    del 		    = require('del'),
    bower 		  = require('gulp-bower'),
    imagemin 	  = require('gulp-imagemin'),
    ftp         = require('gulp-ftp'),
    minifyHTML  = require('gulp-minify-html'),
    minifyCSS   = require('gulp-minify-css'),
    prompt      = require('gulp-prompt'),
    rev         = require('gulp-rev'),
    uncss       = require('gulp-uncss'),
    svgmin      = require('gulp-svgmin'),
    uglify      = require('gulp-uglify'),
    usemin      = require('gulp-usemin'),
    gutil       = require('gulp-util'),
    watch       = require('gulp-watch'),
    browserSync = require('browser-sync'),
    reload      = browserSync.reload;

//var gulp = require('gulp'), plugins = require('gulp-load-plugins')();

///////////////////////////////
// DEVELOPMENT DEFAULT PATHS //
///////////////////////////////
var paths = {
  index:    'app/index.html',
  scripts:  'app/js/**/*',
  styles:   'app/css/**/*',
  assets:   'app/assets/**/*',
  fonts:    'app/assets/fonts/**/*',
  images:    'app/assets/img/**/*'
};

////////////////////////////////
// DISTRUBUTION DEFAULT PATHS //
////////////////////////////////
var dPaths = {
  index:    'dist/index.html',
  scripts:  'dist/js/**/*',
  styles:   'dist/css/**/*',
  assets:   'dist/assets/**/*',
  fonts:    'dist/assets/fonts/**/*',
  images:   'dist/assets/img/**/*'
};


// Welcome message
gutil.log( '=============================================================');
gutil.log( 
	gutil.colors.red('Gulp-Tulp'), 
	gutil.colors.white('SPA Web Application'),
	gutil.colors.blue('Buildsystem') );
gutil.log( '=============================================================');


///////////////
// INIT TASK //
///////////////
 gulp.task('init', function () {
 	gulp.src('templates/index.tmpl.html')
    .pipe(prompt.confirm('Are you ready for Gulp?'))
    .pipe(gulp.dest('app'));
 });

 //////////////////////
// BOWER GULP TASKS //
//////////////////////

// This will default 'install' all Bower packages from bower.json
gulp.task('bower', function() {
  return bower();
});

// This will 'update' all local Bower packages in 
gulp.task('bower:update', function() {
  return bower({ cmd: 'update'});
});

// Clean the 'dist' folder
gulp.task('clean:build', function (cb) {
  del([
  	// Single files
    'build',
    // here we use a globbing pattern to match everything inside the a folder
    //'build/css/**',
    //'build/js/**',
    // we don't want to clean this file though so we negate the pattern use
    //'!dist/mobile/deploy.json'
  ], cb);
});

// The main 'usemin' gulp task
gulp.task('usemin', ['clean:build'], function () {
  return gulp.src('app/index.html')

      .pipe(usemin({
        css: [minifyCSS(), 'concat', rev()],
        html: [minifyHTML({empty: true})],
        js: [uglify(), rev()]
      }))
      .on('error', gutil.log)
      .pipe(gulp.dest('build/'));
});

//////////////////////////////
// WACTHER FOR SOURCE FILES //
//////////////////////////////

// process JS files and return the stream.
gulp.task('scripts', function () {
    return gulp.src(paths.scripts)
        //.pipe(browserify())
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));
});

// process images, vector assets files and return the stream.
gulp.task('images', function () {
    return gulp.src(paths.assets)
    // Pass in options to the task
    .pipe(imagemin({
    	optimizationLevel: 5, 					//PNG level 0/7
    	progressive: true, 						//JPG
    	interlaced: false, 						//GIF
    	svgoPlugins: [							//SVG
    		{ removeViewBox: false }, 
    		{ removeEmptyAttrs: false }
    	], 	
    	use: []
    }))
    .pipe(gulp.dest('build/assets/'));
});


////////////////////////////
// BROWSERSYNC GULP TASKS //
////////////////////////////

// start DEVELOPMENT server
gulp.task('server:dev', function() {
    browserSync({
    	host: "localhost",
    	port: 8080,
    	logLevel: "debug", // debug/info/silent
    	logConnections: true,
    	logFileChanges: true,
    	//browser: ["google chrome", "firefox"],
    	logPrefix: "server:dev",
        server: {
            baseDir: "./app"
        }
    });
});

// start PRODUCTION server
gulp.task('server:build', function() {
    browserSync({
    	host: "localhost",
    	port: 8080,
    	logLevel: "info", // debug/info/silent
    	logConnections: false,
    	logFileChanges: false,
    	browser: ["google chrome", "firefox"],
    	logPrefix: "server:dist",
        server: {
            baseDir: "./build"
        }
    });
});

// Rerun the task when a file changes
gulp.task('watch', function() {
	browserSync.notify("Compiling, please wait!");
  gulp.watch(paths.scripts, ['scripts', browserSync.reload]);
  //gulp.watch(paths.images, ['images', browserSync.reload]);
  gulp.watch( [paths.index, paths.styles], [ 'usemin','images', browserSync.reload] );
});


////////////////////////
// ALL THE MAIN TASKS //
////////////////////////

gulp.task('default', ['server:dev', 'watch']);