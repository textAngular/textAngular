describe('Basic Initiation without ng-model', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test"><p>Test Content</p></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	describe('Adds Correct Classes and Elements', function () {
		it('add .ta-root to base element', function(){
			expect(jQuery(element).hasClass('.ta-root'));
		});
		it('adds 2 .ta-editor elements', function(){
			expect(jQuery('.ta-editor', element).length).toBe(2);
		});
		it('adds the WYSIWYG div', function(){
			expect(jQuery('div.ta-text.ta-editor', element).length).toBe(1);
		});
		it('adds the textarea', function(){
			expect(jQuery('textarea.ta-html.ta-editor', element).length).toBe(1);
		});
		it('adds one hidden form submission element', function(){
			expect(jQuery('input[type=hidden]', element).length).toBe(1);
			expect(jQuery('input[name=test]', element).length).toBe(1);
		});
	});
});

describe('Add classes via attributes', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test" ta-focussed-class="test-focus-class" ta-text-editor-class="test-text-class" ta-html-editor-class="test-html-class"></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	
	describe('Adds Correct Classes', function () {
		it('initially has no focus class', function(){
			expect(!jQuery(element).hasClass('.test-focus-class'));
		});
		it('adds focus class when ta-text is focussed', function(){
			jQuery('.ta-text', element).trigger('focus');
			expect(jQuery(element).hasClass('.test-focus-class'));
		});
		it('adds focus class when ta-html is focussed', function(){
			jQuery('.ta-html', element).trigger('focus');
			expect(jQuery(element).hasClass('.test-focus-class'));
		});
		it('adds text editor class', function(){
			expect(jQuery('.ta-text', element).hasClass('.test-text-class'));
		});
		it('adds html editor class', function(){
			expect(jQuery('.ta-html', element).hasClass('.test-html-class'));
		});
	});
});