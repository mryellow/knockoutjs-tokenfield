module.exports = function(grunt) {
'use strict';

grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	concat: {
		options: {
			stripBanners: {
				separator: "\n",
				block: true, /*! ...will be untouched... */
				line: true
			}
		},
		build: {
			files: [
				{'build/<%= pkg.name %>.css': ['src/**/*.css']},
				{'build/<%= pkg.name %>.js': ['src/intro.txt', 'src/knockoutjs-tokenfield.js', 'src/outro.txt']}
			]
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
		build: {
			files: [
				{
					expand: true,
					cwd: 'build/',
					src: ['**/*.js','!**/*.min.js'],
					dest: 'build/',
					ext: '.min.js',
					extDot: 'last',
					filter: 'isFile'
				}
			]
		}
	},

	copy: {
		dist: {
			files: [
				{'dist/<%= pkg.name %>.css': ['build/<%= pkg.name %>.css']},
				{'dist/<%= pkg.name %>.js': ['build/<%= pkg.name %>.js']},
				{'dist/<%= pkg.name %>.min.js': ['build/<%= pkg.name %>.min.js']}
			]
		}
	}

});

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.registerTask('default', ['concat','uglify']);
grunt.registerTask('dist', ['default','copy']);

};