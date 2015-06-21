var util =	require('gulp-util'),
	shell = require('gulp-shell'),
	pjson = require('../package.json');

module.exports = {   
  banner: function() {
	util.log( '====================================================================');
	util.log( util.colors.grey('             _             _         _       '));
	util.log( util.colors.grey('  __ _ _   _| |_ __       | |_ _   _| |_ __  '));
	util.log( util.colors.grey(' / _` | | | | | \'_ \\ _____| __| | | | | \'_ \\ '), util.colors.red('Web-dev Build-system'));
	util.log( util.colors.grey('| (_| | |_| | | |_) |_____| |_| |_| | | |_) |'),util.colors.white('[Version '+pjson.version+']'));
	util.log( util.colors.grey(' \\__, |\\__,_|_| .__/       \\__|\\__,_|_| .__/ '),   util.colors.blue('(c) 2015 '+pjson.author+'.'));
	util.log( util.colors.grey(' |___/        |_|                     |_|    '));
	util.log( util.colors.grey('                                             '));
	util.log( '====================================================================');
	util.log( util.colors.grey('Use the'), 
			  util.colors.cyan('gulp help'), 
			  util.colors.grey('for help'),
			  util.colors.cyan('gulp menu'), 
			  util.colors.grey('to see all tasks.'));
	util.log( '====================================================================');
  },
  bannerSmall: function() {
    util.log( '====================================================================');
	util.log( util.colors.red(' _ _  _  _ _ '));
	util.log( util.colors.red('| | |(_)| | |'),
	          util.colors.white('Gulp'), 
	          util.colors.blue('Buildsystem') ,
	          util.colors.yellow('[Version 1.0.0 - Build 020514]'));     
	util.log( '====================================================================');
	util.log( util.colors.grey('Copyright (c) 2015 Z3bbster. All rights reserved.') );
	util.log( '====================================================================');
	util.log( util.colors.grey('Use the'), 
			  util.colors.cyan('gulp help'), 
			  util.colors.grey('for help'),
			  util.colors.cyan('gulp menu'), 
			  util.colors.grey('to see all tasks.'));
	util.log( '====================================================================');
  },
  bannerTask: function(message) {
      util.log( util.colors.cyan('===================================================================='));
	  util.log( util.colors.cyan( message ));
	  util.log( util.colors.cyan('===================================================================='));
  },
  about: function() {
      util.log( '====================================================================');
	  util.log( util.colors.grey('A Gulp only build system for a fast, quick and easy no-nosense'));
	  util.log( util.colors.grey('automated and enhance (AngularJS) web development workflow.'));
	  util.log( '');
	  util.log( util.colors.grey('Projectpage: ' + pjson.repository.url));
	  util.log( '');
	  util.log( util.colors.grey('TULP" is the Dutch translation for "tulip". The tulip is a peren-'));
	  util.log( util.colors.grey('nial, bulbous plant with showy flowers in the genus Tulipa, of'));
	  util.log( util.colors.grey('which around 75 wildspecies are currently accepted[1] and which'));
	  util.log( util.colors.grey('belongs to the family Liliaceae.'));
	  util.log( '====================================================================');
  },
  errorHandler: function (task) {
  	return function(err) {
		// Gulp plumber error handler
		util.log( util.colors.red('===================================================================='));
		util.log( util.colors.red(task + ' ERROR:'));
		util.log( util.colors.red('===================================================================='));
		util.log( err);
		util.log( util.colors.red('===================================================================='));
		this.emit('end');
	}
  },
  helpCfg: function () {
  	return { description: 'Displays help text. "help --all" shows all.', aliases: ['h', '?'] };
  },
  menu: function () {
  	return function () { menu(this); }
  },
  getVersions: function () {
  	return shell.task([
	  'echo Current NodeJs: && node -v',
	  'echo Current NPM: && npm -v',
	  'echo Current Bower: && bower -v',
	  'echo Current Gulp: && gulp -v'
	]);
  }

};