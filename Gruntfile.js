module.exports = function (grunt) {
	
	// load all grunt tasks
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-istanbul-coverage');
	grunt.loadNpmTasks('grunt-karma');
	
	// Default task.
	grunt.registerTask('default', ['test', 'uglify']);
	grunt.registerTask('test', ['jshint', 'karma', 'coverage']);
	
	var testConfig = function (configFile, customOptions) {
		var options = { configFile: configFile, keepalive: true };
		var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
		return grunt.util._.extend(options, customOptions, travisOptions);
	};
	
	// Project configuration.
	grunt.initConfig({
		coverage: {
		  options: {
			thresholds: {
			  'statements': 100,
			  'branches': 95,
			  'lines': 100,
			  'functions': 100
			},
			dir: 'coverage',
			root: ''
		  }
		},
		karma: {
		  unit: {
			options: testConfig('karma.conf.js')
		  }
		},
		jshint: {
		  files: ['textAngular.js', 'test/**/*.spec.js'],
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
		uglify: {
			options: {
				mangle: true,
				compress: true
			},
			my_target: {
				files: {
					'textAngular.min.js': ['textAngular.js']
				}
			}
		}
	});
};