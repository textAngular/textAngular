describe('taBind._taBlankTest', function () {
	'use strict';
	beforeEach(module('textAngular'));
	afterEach(inject(function($document){
		$document.find('body').html('');
	}));
	var testString = function(result){ return function(_str){
		it(_str, inject(function (_taBlankTest) {
			expect(_taBlankTest('<p><br></p>')(_str)).toBe(result);
		}));
	};};
	
	describe('should return true for', function () {
		it('undefined', inject(function (_taBlankTest) {
			expect(_taBlankTest('<p><br></p>')()).toBe(true);
		}));
		angular.forEach(['<p></p>','<p><br></p>',''], testString(true));
	});
	
	describe('should return false for', function () {
		angular.forEach(
			['<p>test</p>','<p>Test Some<br></p>','Some Test','<p><img class="ta-insert-video" src="https://img.youtube.com/vi/sbQQKI1Fwo4/hqdefault.jpg" ta-insert-video="https://www.youtube.com/embed/sbQQKI1Fwo4" contenteditable="false" allowfullscreen="true" frameborder="0"><br></p>'],
			testString(false)
		);
	});

});