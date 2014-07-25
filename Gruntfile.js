module.exports = function(grunt) {
'use strict';

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	uglify: {
		options: {
			banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> */\n',
			preserveComments: false,
			compress: {
				drop_console: true,
			}
		},
		dist: {
			files: [
				{
					expand: true,
					cwd: 'src/',
					src: ['**/*.js','!**/*.min.js'],
					dest: 'dist/',
					ext: '.min.js',
					extDot: 'last',
					filter: 'isFile'
				}
			]
		}
	}

});

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.registerTask('default', ['uglify']);

};