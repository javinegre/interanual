
module.exports = function(grunt) {

	var includes = grunt.file.readJSON('./grunt/includes.json');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					sourcemap: 'none'
				},
				files: {
					'app/public/css/style.css' : 'app/stylesheets/sass/style.scss'
				}
			}
		},
		//
		// Js concat
		//
		concat: {
			options: {
				separator: "/*  #############################################  */"
			},
			'js-app': {
				src: includes.js.app,
				dest: 'app/public/js/app.js',
			},
			'js-vendor': {
				src: includes.js.vendor,
				dest: 'app/public/js/libraries.js',
			},
		},
		//
		// Js uglify
		//
		uglify: {
			options: {
				banner: '/*! Interanual app.js <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'app/public/js/app.js': [ 'app/public/js/app.js' ]
				}
			}
		},
		//
		// Html
		//
		assemble: {
			options: {
				partials: ['app/views/partials/**/*.hbs'],
				layout: ['app/views/layouts/default.hbs']
			},
			site: {
				src: ['app/views/index.hbs'],
				dest: 'app/public/index.hbs'
			}
		},
		watch: {
			css: {
				files: 'app/stylesheets/sass/**/*.scss',
				tasks: ['sass']
			},
			js: {
				files: 'app/js/src/**/*.js',
				tasks: ['concat:js-app']
			},
			html: {
				files: 'app/views/**/*.hbs',
				tasks: ['assemble']
			}
		}
	});

	grunt.loadNpmTasks('grunt-assemble');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('dev', [ 'concat:js-vendor', 'concat:js-app', 'sass', 'assemble', 'watch' ]);
	grunt.registerTask('prod', [ 'concat:js-vendor', 'concat:js-app', 'sass', 'assemble', 'uglify' ]);

	grunt.registerTask('default', [ 'dev' ]);

}