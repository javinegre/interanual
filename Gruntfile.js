
module.exports = function(grunt) {

	var appJs = [
		'app/js/src/mixins.js',
		'app/js/src/charts.js',
		'app/js/src/app.js'
	],
		vendorJs = [
		'node_modules/d3/d3.min.js',
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/moment/min/moment.min.js',
		'node_modules/underscore/underscore-min.js'
	];

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
				src: appJs,
				dest: 'app/public/js/app.js',
			},
			'js-vendor': {
				src: vendorJs,
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
		watch: {
			css: {
				files: 'app/stylesheets/sass/**/*.scss',
				tasks: ['sass']
			},
			js: {
				files: 'app/js/src/**/*.js',
				tasks: ['concat:js-app']
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('dev', [ 'concat:js-vendor', 'concat:js-app', 'sass', 'watch' ]);
	grunt.registerTask('prod', [ 'concat:js-vendor', 'concat:js-app', 'sass', 'uglify' ]);

	grunt.registerTask('default', [ 'dev' ]);

}