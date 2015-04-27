module.exports = function (grunt) {
	
	// load all grunt tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-istanbul-coverage');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-karma-coveralls');
	grunt.loadNpmTasks('grunt-conventional-changelog');
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-git');
	grunt.loadNpmTasks('grunt-shell');
	
	grunt.registerTask('compile', ['concat', 'jshint', 'uglify']);
	grunt.registerTask('default', ['compile', 'test']);
	grunt.registerTask('test', ['clean', 'jshint', 'karma', 'coverage']);
	grunt.registerTask('travis-test', ['concat', 'jshint', 'karma', 'coverage', 'coveralls']);
	
	grunt.registerTask('release', ['bump-only','compile','changelog','gitcommit','bump-commit', 'shell:publish']);
	grunt.registerTask('release:patch', ['bump-only:patch','compile','changelog','gitcommit','bump-commit', 'shell:publish']);
	grunt.registerTask('release:minor', ['bump-only:minor','compile','changelog','gitcommit','bump-commit', 'shell:publish']);
	grunt.registerTask('release:major', ['bump-only:major','compile','changelog','gitcommit','bump-commit', 'shell:publish']);
	grunt.registerTask('release:prerelease', ['bump-only:prerelease','compile','changelog','gitcommit','bump-commit', 'shell:publish']);
	
	var testConfig = function (configFile, customOptions) {
		var options = { configFile: configFile, keepalive: true };
		var travisOptions = process.env.TRAVIS && { browsers: ['PhantomJS'], reporters: ['dots','coverage'] };
		return grunt.util._.extend(options, customOptions, travisOptions);
	};
	
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		changelog: {options: {dest: 'changelog.md'}},
		
		bump: {
			options: {
				files: ['package.json','bower.json'],
				commitFiles: ['package.json', 'changelog.md','bower.json'],
				pushTo: 'origin',
				updateConfigs: ['pkg']
			}
		},
		gitcommit: {
			release: {
				options: {
					message: "chore(release): Build Dist files"
				},
				files: {
					src: ['src/*','dist/*']
				}
			}
		},
		shell: {
			publish: {
				command: "npm publish"
			}
		},
		clean: ["coverage"],
		coverage: {
		  options: {
		  	thresholds: {
			  'statements': 100,
			  'branches': 100,
			  'lines': 100,
			  'functions': 100
			},
			dir: 'coverage'
		  }
		},
		coveralls: {
			options: {
				debug: true,
				coverage_dir: 'coverage',
				force: true
			}
		},
		karma: {
		  jquery: {
			options: testConfig('karma-jquery.conf.js')
		  },
		  jqlite: {
			options: testConfig('karma-jqlite.conf.js')
		  }
		},
		jshint: {
		  files: ['lib/*.js', 'src/textAngularSetup.js', 'test/*.spec.js', 'test/taBind/*.spec.js'],// don't hint the textAngularSanitize as they will fail
		  options: {
			eqeqeq: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			sub: true,
			boss: true,
			eqnull: true,
			globals: {}
		  }
		},
		concat: {
			options: {
				banner: "/*\n@license textAngular\nAuthor : Austin Anderson\nLicense : 2013 MIT\nVersion <%- pkg.version %>\n\nSee README.md or https://github.com/fraywing/textAngular/wiki for requirements and use.\n*/\n\n(function(){ // encapsulate all variables so they don't become global vars\n\"use strict\";",
				footer: "})();"
			},
			dist: {
				src: ['lib/globals.js','lib/factories.js','lib/DOM.js','lib/validators.js','lib/taBind.js','lib/main.js'],
				dest: 'src/textAngular.js'
			}
		},
		uglify: {
			options: {
				mangle: true,
				compress: {},
				wrap: true,
				preserveComments: 'some'
			},
			my_target: {
				files: {
					'dist/textAngular-rangy.min.js': ['bower_components/rangy/rangy-core.js', 'bower_components/rangy/rangy-selectionsaverestore.js'],
					'dist/textAngular.min.js': ['src/textAngularSetup.js','src/textAngular.js'],
					'dist/textAngular-sanitize.min.js': ['src/textAngular-sanitize.js']
				}
			}
		},
		watch: {
			files: "lib/*.js",
			tasks: "concat"
		}
	});
};
