/*
	Display Tests
*/

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

describe('Change classes via decorator', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular', function($provide){
		// change all the classes at once
		$provide.decorator('taOptions', ['$delegate', function(taOptions){
			taOptions.classes.focussed = "test-focus-class";
			taOptions.classes.disabled = "disabled-test";
			taOptions.classes.textEditor = 'test-text-class';
			taOptions.classes.htmlEditor = 'test-html-class';
			return taOptions;
		}]);
	}));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test"></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	it('should add .test-focus-class instead of default .focussed', function(){
		jQuery('.ta-text', element).trigger('focus');
		expect(jQuery(element).hasClass('.test-focus-class'));
	});
	it('adds text editor class', function(){
		expect(jQuery('.ta-text', element).hasClass('.test-text-class'));
	});
	it('adds html editor class', function(){
		expect(jQuery('.ta-html', element).hasClass('.test-html-class'));
	});
	it('adds disabled class', function(){
		expect(jQuery(element).hasClass('.disabled-test'));
	});
});

describe('Add tabindex attribute', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test" tabindex="42"></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	
	describe('Check copied across', function () {
		it('to textEditor', function(){
			expect(jQuery('.ta-text', element).attr('tabindex')).toBe('42');
		});
		it('to htmlEditor', function(){
			expect(jQuery('.ta-html', element).attr('tabindex')).toBe('42');
		});
	});
});

describe('Disable the editor', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		$rootScope.disabled = true;
		element = _$compile_('<text-angular name="test" ta-disabled="disabled"></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	
	describe('check disabled class', function () {
		it('is added initially', function(){
			expect(jQuery(element).hasClass('disaled'));
		});
		it('is removed on change to false', function(){
			$rootScope.disabled = false;
			$rootScope.$digest();
			expect(!jQuery(element).hasClass('disabled'));
		});
		it('is added on change to true', function(){
			$rootScope.disabled = false;
			$rootScope.$digest();
			$rootScope.disabled = true;
			$rootScope.$digest();
			expect(jQuery(element).hasClass('disabled'));
		});
	});
});

describe('Check view change', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test"></text-angular>')($rootScope);
		$rootScope.$digest();
	}));
	
	it('initially should hide .ta-html and show .ta-text', function(){
		expect(jQuery('.ta-text', element).is(':visible'));
		expect(!jQuery('.ta-html', element).is(':visible'));
	});
	
	describe('from WYSIWYG text to RAW HTML view', function () {
		it('should hide .ta-text and show .ta-html', function(){
			jQuery("button[name=html]").click();
			expect(!jQuery('.ta-text', element).is(':visible'));
			expect(jQuery('.ta-html', element).is(':visible'));
		});
	});
	
	describe('from RAW HTML to WYSIWYG text view', function () {
		it('should hide .ta-html and show .ta-text', function(){
			jQuery("button[name=html]").click();
			jQuery("button[name=html]").click();
			expect(jQuery('.ta-text', element).is(':visible'));
			expect(!jQuery('.ta-html', element).is(':visible'));
		});
	});
});

describe('Check focussed class adding', function(){
	'use strict';
	var $rootScope, element;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		element = _$compile_('<text-angular name="test"></text-angular>')($rootScope);
		$rootScope.$digest();
		element.trigger('focusin');
	}));
	
	it('should have added .focussed', function(){
		expect(jQuery(element).hasClass('focussed'));
	});
	
	it('should have removed .focussed', function(){
		element.trigger('focusout');
		expect(!jQuery(element).hasClass('focussed'));
	});
});

/*
	Data Tests
*/

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