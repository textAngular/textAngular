describe('taBind', function () {
	'use strict';
	beforeEach(module('textAngular'));
	afterEach(inject(function($document){
		$document.find('body').html('');
	}));
	var $rootScope;
	
	it('should require ngModel', inject(function ($compile, $rootScope) {
		expect(function () {
			$compile('<div ta-bind></div>')($rootScope);
			$rootScope.$digest();
		}).toThrow();
	}));
	
	it('should add ta-bind class', inject(function ($compile, $rootScope) {
		var element = $compile('<div ta-bind ng-model="test"></div>')($rootScope);
		$rootScope.$digest();
		expect(element.hasClass('ta-bind')).toBe(true);
	}));
	
	describe('should function as an WYSIWYG div', function () {
		var $rootScope, element;
		
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.html()).toBe('<p>Test Contents</p>');
		});
		it('should update model from keyup', function () {
			element.html('<div>Test 2 Content</div>');
			element.triggerHandler('keyup');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update model from update function', function () {
			element.html('<div>Test 2 Content</div>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.html()).toBe('<div>Test 2 Content</div>');
		});
		it('should wrap content from model change', function () {
			$rootScope.html = 'Test 2 Content';
			$rootScope.$digest();
			expect(element.html()).toBe('<p>Test 2 Content</p>');
		});
		
		it('should prevent links default event', function () {
			$rootScope.html = '<div><a href="test">Test</a> 2 Content</div>';
			$rootScope.$digest();
			element.find('a').on('click', function(e){
				expect(e.isDefaultPrevented());
			});
			jQuery(element.find('a')[0]).trigger('click');
		});
		
		describe('should trim empty content', function(){
			it('returns undefined when <p></p>', function(){
				element.html('<p></p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when <p><br/></p>', function(){
				element.html('<p><br/></p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when single whitespace', function(){
				element.html('<p> </p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when single &nbsp;', function(){
				element.html('<p>&nbsp;</p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined when multiple &nbsp;', function(){
				element.html('<p>&nbsp;&nbsp;&nbsp;</p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
			it('returns undefined whith mixed &nbsp; and whitespace', function(){
				element.html('<p>&nbsp; &nbsp; &nbsp;</p>');
				$rootScope.updateTaBind();
				$rootScope.$digest();
				expect($rootScope.html).toBe('');
			});
		});
		
		describe('should respect the ta-default-wrap value', function(){
			describe('on focus', function(){
				it('default to p element', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('focus');
					$rootScope.$digest();
					expect(element.html()).toBe('<p><br></p>');
				}));
				it('set to other value', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="div" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('focus');
					$rootScope.$digest();
					expect(element.html()).toBe('<div><br></div>');
				}));
				it('set to blank should not wrap', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('focus');
					$rootScope.$digest();
					expect(element.html()).toBe('');
				}));
			});
			describe('on keyup', function(){
				it('default to p element', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('<p><br></p>');
				}));
				it('set to other value', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="div" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('<div><br></div>');
				}));
				it('set to blank should not wrap', inject(function($rootScope, $compile){
					$rootScope.html = '';
					element = $compile('<div ta-bind ta-default-wrap="" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$rootScope.$digest();
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('');
				}));
			});
			describe('on ignoring keys press', function() {
				it('should ignore blocked keys events', inject(function($rootScope, $compile, $window, $document, taSelection) {
					var BLOCKED_KEYS = [19,20,27,33,34,35,36,37,38,39,40,45,46,112,113,114,115,116,117,118,119,120,121,122,123,144,145],
						eventSpy = spyOn(taSelection, 'setSelectionToElementStart').andCallThrough(),
						event;
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);

					BLOCKED_KEYS.forEach(function(key) {
						if(angular.element === jQuery) {
							event = jQuery.Event('keyup');
							event.keyCode = key;
							element.triggerHandler(event);
						}else{
							event = {keyCode: key};
							element.triggerHandler('keyup', event);
						}
						$rootScope.$digest();
						expect(eventSpy).not.toHaveBeenCalled();
					});
					element.remove();
				}));
			});
			describe('on enter press', function(){
				it('replace inserted with default wrap', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<b><br></b>');
					element.remove();
				}));
				it('NOT replace inserted with default wrap when shift', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						event.shiftKey = true;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13, shiftKey: true};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<p><br></p>');
					element.remove();
				}));
				it('NOT replace inserted with default wrap when a li', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<li><br></li>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<li><br></li>');
					element.remove();
				}));
				it('NOT replace inserted with default wrap when nested in a li', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<li><i><br></i></li>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.children()[0].childNodes[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keyup');
						event.keyCode = 13;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13};
						element.triggerHandler('keyup', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<li><i><br></i></li>');
					element.remove();
				}));
				it('should replace inserted with default wrap when empty', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<p><br></p>';
					element = $compile('<div ta-bind ta-default-wrap="b" contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					element[0].innerHTML = '';
					element.triggerHandler('keyup');
					$rootScope.$digest();
					expect(element.html()).toBe('<b><br></b>');
					element.remove();
				}));
				it('should escape blockquote when only empty element', inject(function($rootScope, $compile, $window, $document){
					$rootScope.html = '<blockquote><p><br></p></blockquote>';
					element = $compile('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
					$document.find('body').append(element);
					$rootScope.$digest();
					var range = $window.rangy.createRangyRange();
					range.selectNodeContents(element.find('p')[0]);
					$window.rangy.getSelection().setSingleRange(range);
					var event;
					if(angular.element === jQuery){
						event = jQuery.Event('keydown');
						event.keyCode = 13;
						element.triggerHandler(event);
					}else{
						event = {keyCode: 13};
						element.triggerHandler('keydown', event);
					}
					$rootScope.$digest();
					expect(element.html()).toBe('<p><br></p>');
					element.remove();
				}));
			});
		});
	});

	describe('should function as an textarea', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<textarea ta-bind ng-model="html"></textarea>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.val()).toBe('<p>Test Contents</p>');
		});
		it('should update model from change', function () {
			element.val('<div>Test 2 Content</div>');
			element.triggerHandler('blur');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update model from update function', function () {
			element.val('<div>Test 2 Content</div>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.val()).toBe('<div>Test 2 Content</div>');
		});
	});

	describe('should function as an input', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<input ta-bind ng-model="html"/>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.val()).toBe('<p>Test Contents</p>');
		});
		it('should update model from change', function () {
			element.val('<div>Test 2 Content</div>');
			element.triggerHandler('blur');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update model from update function', function () {
			element.val('<div>Test 2 Content</div>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.val()).toBe('<div>Test 2 Content</div>');
		});
	});
	
	describe('should create the updateTaBind function on parent scope', function () {
		describe('without id', function () {
			it('should exist', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$compile_('<textarea ta-bind ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(_$rootScope_.updateTaBind).toBeDefined();
			}));
		});

		describe('with id', function () {
			it('should exist', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$compile_('<textarea id="Test" ta-bind ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(_$rootScope_.updateTaBindTest).toBeDefined();
			}));
		});
	});
	
	describe('custom renderers', function () {
		describe('function in display mode', function () {
			beforeEach(inject(function(taCustomRenderers){
				taCustomRenderers.push({
					// Parse back out: '<div class="ta-insert-video" ta-insert-video src="' + urlLink + '" allowfullscreen="true" width="300" frameborder="0" height="250"></div>'
					// To correct video element. For now only support youtube
					selector: 'a',
					renderLogic: function(_element){
						_element.replaceWith(angular.element('<b></b>'));
					}
				});
				taCustomRenderers.push({
					// Parse back out: '<div class="ta-insert-video" ta-insert-video src="' + urlLink + '" allowfullscreen="true" width="300" frameborder="0" height="250"></div>'
					// To correct video element. For now only support youtube
					customAttribute: 'href',
					renderLogic: function(_element){
						_element.replaceWith(angular.element('<i></i>'));
					}
				});
			}));
			
			afterEach(inject(function(taCustomRenderers){
				taCustomRenderers.pop();
				taCustomRenderers.pop();
			}));
			
			it('should replace with custom code for video renderer', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><img class="ta-insert-video" ta-insert-video="http://www.youtube.com/embed/2maA1-mvicY" src="" allowfullscreen="true" width="300" frameborder="0" height="250"/></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('img').length).toBe(0);
				expect(element.find('iframe').length).toBe(1);
			}));
			
			it('should not replace with custom code for normal img', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><img src=""/></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('img').length).toBe(1);
				expect(element.find('iframe').length).toBe(0);
			}));
			
			it('should replace for selector only', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><a></a></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('a').length).toBe(0);
				expect(element.find('b').length).toBe(1);
			}));
			
			it('should replace for attribute only', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><span href></span><b href></b></p>';
				var element = $compile('<div ta-bind ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('span').length).toBe(0);
				expect(element.find('b').length).toBe(0);
				expect(element.find('i').length).toBe(2);
			}));
		});
		
		describe('not function in edit mode', function () {
			it('should exist', inject(function ($compile, $rootScope) {
				$rootScope.html = '<p><img class="ta-insert-video" ta-insert-video="http://www.youtube.com/embed/2maA1-mvicY" src="" allowfullscreen="true" width="300" frameborder="0" height="250"/></p>';
				var element = $compile('<div ta-bind contenteditable="true" ng-model="html"></div>')($rootScope);
				$rootScope.$digest();
				expect(element.find('img').length).toBe(1);
				expect(element.find('iframe').length).toBe(0);
			}));
		});
	});
});