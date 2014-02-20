
module.exports = function (config) {
	'use strict';
	config.set({

		frameworks: ['jasmine'],

		plugins: [
			'karma-jasmine',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-browserstack-launcher',
			'karma-coverage'
		],
		
		browserStack: {
			username: 'SimeonCheeseman',
			accessKey: 'uXtrS8MdBaoOYAoQVYeD'
		},
		
		// define browsers
		customLaunchers: {
			bs_ie8: {
				base: 'BrowserStack',
				browser: 'ie',
				browser_version: '8.0',
				os: 'Windows',
				os_version: '7'
			},
			bs_ie9: {
				base: 'BrowserStack',
				browser: 'ie',
				browser_version: '9.0',
				os: 'Windows',
				os_version: '7'
			},
			bs_ie10: {
				base: 'BrowserStack',
				browser: 'ie',
				browser_version: '10.0',
				os: 'Windows',
				os_version: '7'
			},
			bs_ff: {
				base: 'BrowserStack',
				browser: 'firefox',
				browser_version: 'latest',
				os: 'Windows',
				os_version: '7'
			},
			bs_chrome: {
				base: 'BrowserStack',
				browser: 'chrome',
				browser_version: 'latest',
				os: 'Windows',
				os_version: '7'
			},
			bs_safari: {
				base: 'BrowserStack',
				browser: 'safari',
				browser_version: 'latest',
				os: 'OS X',
				os_version: 'Mavericks'
			},
		},
		
		files: [
			'bower_components/jquery/jquery.min.js',
			'bower_components/rangy/rangy-core.js',
			'bower_components/rangy/rangy-selectionsaverestore.js',
			'bower_components/angular/angular.min.js',
			'bower_components/angular-mocks/angular-mocks.js',
			'textAngular-sanitize.js',
			'textAngular.js',
			'test/**/*.spec.js'
		],

		// list of files to exclude
		exclude: [

		],

		preprocessors: {
			'textAngular.js': ['coverage']
		},

		// test results reporter to use
		// possible values: 'dots', 'progress', 'junit'
		reporters: ['progress', 'coverage'],

		// web server port
		port: 9876,


		// cli runner port
		runnerPort: 9100,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,


		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		//browsers: ['Chrome','Firefox'],
		browsers: ['Chrome'],


		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,


		// Continuous Integration mode
		// if true, it capture browsers, run tests and exit
		singleRun: true
	});
};