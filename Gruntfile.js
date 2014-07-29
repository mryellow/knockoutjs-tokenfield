module.exports = function(grunt) {
'use strict';

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	concat: {
		css: {
			options: {
				stripBanners: {
					separator: "\n",
					block: true, /*! ...will be untouched... */
					line: true
				}
			},
			files: [{
				expand: true,
				cwd: 'build_cache/css/',
				src: ['**/*.css','!**/*.min.css'], // Skip distributed minified
				dest: 'build_cache/concat.css/',
				ext: '.css',
				extDot: 'first',
				filter: 'isFile'
			},{'dist/<%= pkg.name %>.css': ['src/**/*.css']}]
		}
	},

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

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.registerTask('default', ['concat','uglify']);

};