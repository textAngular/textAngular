describe('Basic Initiation without ng-model', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test"><p>Test Content</p></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	describe('Inserts the current information into the fields', function(){
		it('populates the WYSIWYG area', function(){
			expect(jQuery('.ta-text p', element).length).toBe(1);
		});
		it('populates the textarea', function(){
			expect(jQuery('.ta-html', element).val()).toBe('<p>Test Content</p>');
		});
		it('populates the hidden input value', function(){
			expect(jQuery('input[type=hidden]', element).val()).toBe('<p>Test Content</p>');
		});
	});
});

describe('Basic Initiation with ng-model', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		$rootScope.htmlcontent = '<p>Test Content</p>';
		element = _$compile_('<text-angular name="test" ng-model="htmlcontent"></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	describe('Inserts the current information into the fields', function(){
		it('populates the WYSIWYG area', function(){
			expect(jQuery('.ta-text p', element).length).toBe(1);
		});
		it('populates the textarea', function(){
			expect(jQuery('.ta-html', element).val()).toBe('<p>Test Content</p>');
		});
		it('populates the hidden input value', function(){
			expect(jQuery('input[type=hidden]', element).val()).toBe('<p>Test Content</p>');
		});
	});
});

describe('Updates without ng-model', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test"><p>Test Content</p></text-angular>')($rootScope);
		$rootScope.$digest();
		jQuery('.ta-text', element).html('<div>Test Change Content</div>');
		jQuery('.ta-text', element).trigger('keyup');
		$rootScope.$digest();
	}));
	
	describe('updates from .ta-text', function(){
		it('should update .ta-html', function(){
			expect(jQuery('.ta-html', element).val()).toBe('<div>Test Change Content</div>');
		});
		it('should update input[type=hidden]', function(){
			expect(jQuery('input[type=hidden]', element).val()).toBe('<div>Test Change Content</div>');
		});
	});
	
	describe('updates from .ta-html', function(){
		it('should update .ta-text', function(){
			expect(jQuery('.ta-text', element).html()).toBe('<div>Test Change Content</div>');
		});
		it('should update input[type=hidden]', function(){
			expect(jQuery('input[type=hidden]', element).val()).toBe('<div>Test Change Content</div>');
		});
	});
});

describe('Updates with ng-model', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		$rootScope.htmlcontent = '<p>Test Content</p>';
		element = _$compile_('<text-angular name="test" ng-model="htmlcontent"></text-angular>')($rootScope);
		$rootScope.$digest();
		$rootScope.htmlcontent = '<div>Test Change Content</div>';
		$rootScope.$digest();
	}));
	
	describe('updates from model to display', function(){
		it('should update .ta-html', function(){
			expect(jQuery('.ta-html', element).val()).toBe('<div>Test Change Content</div>');
		});
		it('should update .ta-text', function(){
			expect(jQuery('.ta-text', element).html()).toBe('<div>Test Change Content</div>');
		});
		it('should update input[type=hidden]', function(){
			expect(jQuery('input[type=hidden]', element).val()).toBe('<div>Test Change Content</div>');
		});
	});
});