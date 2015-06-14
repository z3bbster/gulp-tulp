/*!
 *  Gulp-tup2 Build System v0.0.1 [22-4-2015]
 * Copyright (c) 2015 z3bbster http://github.com/z3bbster/gulp-tulp
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------------------------------
 * 
 * MOM available commands:
 *
 *  1. gulp - default task, runs server:dev, watch tasks
 *  2. gulp build - create dist, runs useref, imagemin, ng-templatecache tasks
 *  3. gulp ng-templatecache - Concatenates/registers templates in $templateCache
 *  {pattern: ['del','opn','browser-sync','','gulp-*']}
 */
var gt =          require('./gulptulp/gulptulp.js'),
    gulp =        require('gulp-help')(require('gulp'), gt.helpCfg()),
    $ =           require('gulp-load-plugins')(),
    browserSync = require('browser-sync'),
    opn =         require('opn'),
    reload =      browserSync.reload,
    paths =       require('./gulptulp/paths.json'),
    help =        require('./gulptulp/help.js');
    del =         require('del'),
    vinylPaths =  require('vinyl-paths'),
    gulpDocs =    require('gulp-ngdocs');

gt.banner();

///////////////////////////////////
// GULP-TULP SPECIFIC GULP TASKS //
///////////////////////////////////
gulp.task('menu',    help.menu,    function () { $.menu(this); }, {aliases: ['m']} );
gulp.task('about',   help.about,   function() { gt.about(); }, {aliases: ['a']});
gulp.task('version', help.version, gt.getVersions(), {aliases: ['v']});
gulp.task('ref-ng',  help.refNg,   function(){ opn('https://docs.angularjs.org/api', 'chrome'); });
gulp.task('ref-bs',  help.refBs,   function(){ opn('http://getbootstrap.com/css', 'chrome'); });
gulp.task('ref-aw',  help.refAw,   function(){ opn('fortawesome.github.io/Font-Awesome/icons', 'chrome'); });

///////////////////////////////////////
// CLEANING & HOUSKEEPING GULP TASKS //
///////////////////////////////////////
gulp.task('clean:dist', help.cleanDist , function (cb) {
	gt.bannerTask('Time to clean up the "dist" folder!!');
	del(paths.clean.src, cb);
});

gulp.task('clean:node', help.cleanNode , function (cb) {
	console.log(paths.clean.deps.node);
	del(paths.clean.deps.node, cb);
});

gulp.task('clean:bower', help.cleanBower , function (cb) {
	console.log(paths.clean.deps.bower);
	del(paths.clean.deps.bower, cb);
});

gulp.task('copy:dist', help.copyDist, function () {
  gt.bannerTask('Time to copy some files from "app" to "dist"!');
  // copy all (angularJS) views
  gulp.src('./app/views/*')
    .pipe(gulp.dest('dist/views'));

  // copy all data related json files
  gulp.src('./app/data/*.json')
    .pipe(gulp.dest('dist/data'));

  // copy root related files
  gulp.src([
    './app/.htaccess',
    './app/browserconfig.xml',
    './app/crossdomain.xml',
    './app/favicon.ico',
    './app/humans.txt',
    './app/robots.txt'])
    .pipe(gulp.dest('dist'));
});

//////////////////////////////
// PREPROCCESSOR GULP TASKS //
//////////////////////////////
gulp.task('less', false, function () {
  gulp.src([paths.less.src]) // {base: "./app/less"}
    .pipe( $.less())
    .on('error', gt.errorHandler('LESS'))
    .pipe(gulp.dest('app/styles'))
    .pipe(reload({stream: true, once: true}))
    .pipe($.filesize());

});

gulp.task('jshint', false, function () {
  gt.bannerTask('JavaScript Code Quality Tool');
  gulp.src([paths.scripts.src] + '.js')
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint({enforceall: false}))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

/////////////////////////
// OPTIMIZE GULP TASKS //
/////////////////////////
gulp.task('useref', false, ['clean:dist'], function () {
  gt.bannerTask('USEREF - replace references to non-optimized scripts or stylesheets.');
  var assets = $.useref.assets(),
  uglifyCfg = { mangle: true, output: { beautify: false}, preserveComments: false };
  return gulp.src('./app/*.html')
    .pipe(assets) // Get the assets	
    .pipe($.if('*.js', $.stripDebug() )) // Strip console and debugger statements
    .pipe($.if('*.js', $.uglify(uglifyCfg) )) // Uglify only on all *.js files
    //.pipe($.license('MIT', {tiny: false, organization:'z3bbster' }))
    .pipe($.if('*.css', $.minifyCss() ))
    .pipe($.rev()) // rev the *.js and *.css file
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace()) // revReplace the links and scripts in HTML
    .on('error', gt.errorHandler('USEREF'))
    .pipe(gulp.dest('dist'))
    .pipe($.filesize());
});

gulp.task('imagemin', false, function () {
  gt.bannerTask('IMAGEMIN - Optimizing all the graphical assets of your project.');
  gulp.src(paths.assets.all)
    .pipe(reload({stream: true, once: true}))
    // Pass in options to the task
    .pipe($.cached($.imagemin({
      optimizationLevel: 5, 		//PNG level 0/7
      progressive: true, 	  		//JPG
      interlaced: false, 	  		//GIF
      svgoPlugins: [	 			//SVG	  
        { removeViewBox: false }, 
        { removeEmptyAttrs: false },
        { removeDoctype: false }, 
        { removeComments: false },
        { removeEmptyContainers: false }
      ],
        use: []
    })))   
    .pipe($.filesize()) // display filesize
    .on('error', gt.errorHandler('IMAGEMIN'))
    .pipe(gulp.dest('dist/assets/'));
});

gulp.task("resize", function () {
  gulp.src("src/**/*.{jpg,png}")
    .pipe($.changed("dist"))
    .pipe($.imageResize({ width : 100 }))
    .on('error', gt.errorHandler('RESIZE'))
    .pipe(gulp.dest("dist"));
});

gulp.task('watermark', help.watermark, function (cb) {
  gulp.src("./app/assets/img/small/*.jpg")
    .pipe($.watermark({
      image: "./app/assets/img/watermark/watermark1.png",
      resize: '407x611',
      gravity: 'NorthWest'
    }))
    .on('error', gt.errorHandler('WATERMARK'))
    .pipe(gulp.dest("./dist"));
});

///////////////////////////////////
// ANGULARJS SPECIFIC GULP TASKS //
///////////////////////////////////

// Add angularjs dependency injection annotations
gulp.task('ng-annotate', help.ngAnnotate, function () {
  gt.bannerTask('Add angularjs dependency injection annotations');
  gulp.src(paths.scripts.src + '.js')
    //.pipe($.changed(paths.scripts.src))
    .pipe($.ngAnnotate({dynamic: true, remove: false, single_quotes: true}))
    .on('error', gt.errorHandler('NG-ANNOTATE'))
    .pipe(gulp.dest('app/scripts/'))
    .pipe($.filesize());
});

// Concatenates and registers AngularJS templates in the $templateCache.
// Need to include and inject the 'templatescache.js' file in app module
gulp.task('ng-templatecache', help.ngtemplatecache, function() {
  gt.bannerTask('Concatenates/registers AngularJS templates in the $templateCache');
  // Config for templateCache
  var cfg = { 
    module:'templatescache',
    standalone:true,
    //root: './templates/'
  };

  gulp.src( paths.scripts.src + '.tmpl.html' )
    // Load the correct templates
    //.pipe($.changed(paths.scripts.src + '.tmpl.html'))
    // Minify all template first!
    .pipe($.minifyHtml({empty: true}))
    // Start with different filename and load custom cfg from var above
    .pipe( $.angularTemplatecache('templatescache.js', cfg) )
    // Check for errors
    .on('error', gt.errorHandler('NG-TEMPLATECACHE'))
    // Place files to destination
    .pipe( gulp.dest('./dist/js') )
    // Display filesizes
    .pipe($.filesize());
});

gulp.task('ngdocs', help.ngdocs, function () {
  var options = {
    scripts: [
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.16/angular.min.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.3.16/angular-animate.min.js'
    ]
  }
  gulp.src(paths.scripts.src + '.js' )
    .pipe(gulpDocs.process(options))
    .pipe(gulp.dest('./docs'));
});

////////////////////////////
// BROWSERSYNC GULP TASKS //
////////////////////////////
gulp.task('server:dev', help.serverDev, function() {
  browserSync({
    host: "localhost",
    port: 8080,
    logLevel: "info", // debug/info/silent
    logConnections: true,
    logFileChanges: true,
    browser: ["google chrome"],
    logPrefix: "server:dev",
    server: {
      baseDir: "app"
    }
  });
});

gulp.task('server:doc', help.serverDev, function() {
  browserSync({
    host: "localhost",
    port: 8080,
    logLevel: "info", // debug/info/silent
    logConnections: true,
    logFileChanges: true,
    browser: ["google chrome"],
    logPrefix: "server:doc",
    server: {
      baseDir: "./docs"
    }
  });
});

///////////////////////////////////////////
// GLOBAL WATCH TASK FOR ALL FILE CHANGE //
///////////////////////////////////////////
gulp.task('watch', false, function() {
  browserSync.notify("Compiling, please wait!");
  // Watch all JS files
  gulp.watch(paths.scripts.src, ['jshint']);
  // Watch all assets images, SVGs, etc
  gulp.watch(paths.assets.images.src, browserSync.reload);
  // Watch all html files incl. templates and views
  gulp.watch(['./app/index.html', '/app/templates/**/*'], browserSync.reload);
  // Watch less file
  gulp.watch('./app/less/*.less', ['less']);
});

/////////////////////////////
// ALL THE MAIN GULP TASKS //
/////////////////////////////
gulp.task('default', help.default, ['server:dev', 'watch'], function(){
  gt.bannerTask('DEVELOPMENT TIME! Ready when you are, by your command.');
});

gulp.task('build', help.build, ['ng-annotate','ng-templatecache','useref'], function () {
  gulp.start('imagemin');
  gulp.start('copy:dist');
}, {aliases: ['b']});