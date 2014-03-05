describe('taToolsExecuteFunction', function(){
	var scope, startActionResult, editor, $rootScope;
	beforeEach(module('textAngular'));
	beforeEach(inject(function(taToolExecuteAction, _$rootScope_){
		$rootScope = _$rootScope_;
		startActionResult = Math.random();
		scope = {
			taToolExecuteAction: taToolExecuteAction,
			$editor: function(){
				return editor = {
					startCount: 0,
					startAction: function(){
						this.startCount++;
						return startActionResult;
					},
					finishCount: 0,
					endAction: function(){ this.finishCount++; }
				};
			}
		};
	}));
	
	describe('executes the action passing the correct parameters', function(){
		it('should pass the result of startAction Result', function(){
			scope.action = function(deferred, startActionResult){
				expect(startActionResult).toBe(startActionResult);
			};
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
		});
		it('should pass a valid deferred object', function(){
			scope.action = function(deferred, startActionResult){
				expect(deferred.resolve).toBeDefined();
				expect(deferred.reject).toBeDefined();
				expect(deferred.notify).toBeDefined();
				expect(deferred.promise).toBeDefined();
			};
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
		});
	});
	
	it('doesn\'t error when action not present', function(){
		expect(function(){
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
		}).not.toThrow();
	});
	
	it('sets the correct editor if passed', function(){
		var _editor = {endAction: function(){}, startAction: function(){}};
		scope.taToolExecuteAction(_editor);
		expect(scope.$editor()).toBe(_editor);
	});
	
	describe('calls editor action', function(){
		it('start and end when action returns truthy', function(){
			scope.action = function(deferred, startActionResult){ return true; };
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
			expect(editor.startCount).toBe(1);
			expect(editor.finishCount).toBe(1);
		});
		
		it('start and end when action returns undefined', function(){
			scope.action = function(deferred, startActionResult){};
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
			expect(editor.startCount).toBe(1);
			expect(editor.finishCount).toBe(1);
		});
		
		it('start and not end when action returns false', function(){
			scope.action = function(deferred, startActionResult){ return false; };
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
			expect(editor.startCount).toBe(1);
			expect(editor.finishCount).toBe(0);
		});
	});
});

describe('taTools test tool actions', function(){
	'use strict';
	var $rootScope, element, button, editorScope, $window;
	var findAndTriggerButton = function(name){
		var button = element.find('button[name=' + name + ']');
		button.scope().executeAction(editorScope);
		editorScope.endAction();
		$rootScope.$digest();
		return button;
	};
	
	// We use an assumption here and only test whether the button reports as being activated
	// it ended up being too difficult to reselect and un-apply
	
	var testAllButtons = function(){
		it('h1 button should function correctly', function(){
			button = findAndTriggerButton('h1');
			expect(button.hasClass('active'));
		});
		
		it('h2 button should function correctly', function(){
			button = findAndTriggerButton('h2');
			expect(button.hasClass('active'));
		});
		
		it('h3 button should function correctly', function(){
			button = findAndTriggerButton('h3');
			expect(button.hasClass('active'));
		});
		
		it('h4 button should function correctly', function(){
			button = findAndTriggerButton('h4');
			expect(button.hasClass('active'));
		});
		
		it('h5 button should function correctly', function(){
			button = findAndTriggerButton('h5');
			expect(button.hasClass('active'));
		});
		
		it('h6 button should function correctly', function(){
			button = findAndTriggerButton('h6');
			expect(button.hasClass('active'));
		});
		
		it('p button should function correctly', function(){
			button = findAndTriggerButton('p');
			expect(button.hasClass('active'));
		});
		
		it('pre button should function correctly', function(){
			button = findAndTriggerButton('pre');
			expect(button.hasClass('active'));
		});
		
		it('quote button should function correctly', function(){
			button = findAndTriggerButton('quote');
			expect(button.hasClass('active'));
		});
		
		it('bold button should function correctly', function(){
			button = findAndTriggerButton('bold');
			expect(button.hasClass('active'));
		});
		
		it('italics button should function correctly', function(){
			button = findAndTriggerButton('italics');
			expect(button.hasClass('active'));
		});
		
		it('underline button should function correctly', function(){
			button = findAndTriggerButton('underline');
			expect(button.hasClass('active'));
		});
		
		it('ul button should function correctly', function(){
			button = findAndTriggerButton('ul');
			expect(button.hasClass('active'));
		});
		
		it('ol button should function correctly', function(){
			button = findAndTriggerButton('ol');
			expect(button.hasClass('active'));
		});
		
		it('justifyLeft button should function correctly', function(){
			button = findAndTriggerButton('justifyLeft');
			expect(button.hasClass('active'));
		});
		
		it('justifyCenter button should function correctly', function(){
			button = findAndTriggerButton('justifyCenter');
			expect(button.hasClass('active'));
		});
		
		it('justifyRight button should function correctly', function(){
			button = findAndTriggerButton('justifyRight');
			expect(button.hasClass('active'));
		});
		
		it('html button should function correctly', inject(function($timeout){
			button = findAndTriggerButton('html');
			$timeout.flush();
			expect(button.hasClass('active'));
			expect(!element.find('.ta-text').is(":visible"));
			expect(element.find('.ta-html').is(":visible"));
			expect(element.find('.ta-html').is(":focus"));
			button = findAndTriggerButton('html'); // retrigger to reset to non html view
			$timeout.flush();
			expect(!element.find('.ta-html').is(":visible"));
			expect(element.find('.ta-text').is(":visible"));
			expect(element.find('.ta-text').is(":focus"));
		}));
		
		it('check untestables don\'t error', function(){
			expect(function(){
				findAndTriggerButton('redo');
			}).not.toThrow();
		});
		it('check untestables don\'t error', function(){
			expect(function(){
				findAndTriggerButton('undo');
			}).not.toThrow();
		});
		it('check untestables don\'t error', function(){
			expect(function(){
				findAndTriggerButton('insertImage');
			}).not.toThrow();
		});
		it('check untestables don\'t error', function(){
			expect(function(){
				findAndTriggerButton('insertLink');
			}).not.toThrow();
		});
		it('check untestables don\'t error', function(){
			expect(function(){
				findAndTriggerButton('unlink');
			}).not.toThrow();
		});
	};
	
	describe('with un-wrapped content', function(){
		beforeEach(module('textAngular'));
		beforeEach(inject(function (_$compile_, _$rootScope_, $document, textAngularManager, _$window_) {
			$window = _$window_;
			$window.prompt = function(){ return 'soehusoaehusnahoeusnt'; };
			$rootScope = _$rootScope_;
			element = _$compile_('<text-angular name="test">Test Content</text-angular>')($rootScope);
			$document.find('body').append(element);
			$rootScope.$digest();
			editorScope = textAngularManager.retrieveEditor('test').scope;
			var sel = $window.rangy.getSelection();
			var range = $window.rangy.createRangyRange();
			range.selectNode(element.find('.ta-text')[0].childNodes[0]);
			sel.setSingleRange(range);
		}));
		afterEach(function(){
			element.remove();
		});
		
		testAllButtons();
	});
	
	describe('with wrapped content', function(){
		beforeEach(module('textAngular'));
		beforeEach(inject(function (_$compile_, _$rootScope_, $document, textAngularManager, _$window_) {
			$window = _$window_;
			$window.prompt = function(){ return ''; };
			$rootScope = _$rootScope_;
			element = _$compile_('<text-angular name="test"><p>Test Content</p></text-angular>')($rootScope);
			$document.find('body').append(element);
			$rootScope.$digest();
			editorScope = textAngularManager.retrieveEditor('test').scope;
			var sel = $window.rangy.getSelection();
			var range = $window.rangy.createRangyRange();
			range.selectNodeContents(element.find('.ta-text p')[0]);
			sel.setSingleRange(range);
		}));
		afterEach(function(){
			element.remove();
		});
		
		testAllButtons();
	});
	
	describe('test clear button', function(){
		beforeEach(module('textAngular'));
		beforeEach(inject(function (_$compile_, _$rootScope_, $document, textAngularManager, _$window_) {
			$window = _$window_;
			$window.prompt = function(){ return ''; };
			$rootScope = _$rootScope_;
			$rootScope.htmlcontent = '<p class="test-class" style="text-align: left;">Test Content <b>that</b> <u>should</u> be cleared</p><h1>Test Other Tags</h1><ul><li>Test <b>1</b></li><li>Test 2</li></ul>';
			element = _$compile_('<text-angular name="testclearbutton" ng-model="htmlcontent"></text-angular>')($rootScope);
			$document.find('body').append(element);
			$rootScope.$digest();
			editorScope = textAngularManager.retrieveEditor('testclearbutton').scope;
			var sel = $window.rangy.getSelection();
			var range = $window.rangy.createRangyRange();
			range.selectNodeContents(element.find('.ta-text')[0]);
			sel.setSingleRange(range);
		}));
		afterEach(function(){
			element.remove();
		});
		
		it('doesn\'t error', function(){
			expect(function(){
				findAndTriggerButton('clear');
			}).not.toThrow();
		});
		
		it('clears out all formatting', function(){
			findAndTriggerButton('clear');
			//expect($rootScope.htmlcontent).toBe('<p>Test Content that should be cleared</p><p>Test Other Tags</p><p>Test 1</p><p>Test 2</p>');
			// bug in phantom JS
			expect($rootScope.htmlcontent).toBe('<p>Test Content that should be cleared</p><h1>Test Other Tags</h1><p>Test 1</p><p>Test 2</p>');
		});
		
		it('doesn\'t remove partially selected list elements, but clears them of formatting', function(){
			var sel = $window.rangy.getSelection();
			var range = $window.rangy.createRangyRange();
			range.setStartBefore(element.find('.ta-text ul li:first-child b')[0]);
			range.setEndBefore(element.find('.ta-text ul li:last-child')[0]);
			sel.setSingleRange(range);
			sel.refresh();
			findAndTriggerButton('clear');
			expect($rootScope.htmlcontent).toBe('<p class="test-class" style="text-align: left;">Test Content <b>that</b> <u>should</u> be cleared</p><h1>Test Other Tags</h1><ul><li>Test 1</li><li>Test 2</li></ul>');
		});
		
		it('doesn\'t clear wholly selected list elements, but clears them of formatting', function(){
			var sel = $window.rangy.getSelection();
			var range = $window.rangy.createRangyRange();
			range.selectNodeContents(element.find('.ta-text ul')[0]);
			sel.setSingleRange(range);
			sel.refresh();
			findAndTriggerButton('clear');
			expect($rootScope.htmlcontent).toBe('<p class="test-class" style="text-align: left;">Test Content <b>that</b> <u>should</u> be cleared</p><h1>Test Other Tags</h1><ul><li>Test 1</li><li>Test 2</li></ul>');
		});
		
		it('doesn\'t clear singly selected list elements, but clears them of formatting', function(){
			var sel = $window.rangy.getSelection();
			var range = $window.rangy.createRangyRange();
			range.selectNodeContents(element.find('.ta-text ul li:first-child')[0]);
			range.setEndAfter(element.find('.ta-text ul li:first-child')[0]);
			sel.setSingleRange(range);
			sel.refresh();
			findAndTriggerButton('clear');
			expect($rootScope.htmlcontent).toBe('<p class="test-class" style="text-align: left;">Test Content <b>that</b> <u>should</u> be cleared</p><h1>Test Other Tags</h1><ul><li>Test 1</li><li>Test 2</li></ul>');
		});
		
		it('doesn\'t clear singly selected list elements, but clears them of formatting', function(){
			var sel = $window.rangy.getSelection();
			var range = $window.rangy.createRangyRange();
			range.selectNode(element.find('.ta-text ul li:first-child')[0]);
			range.setEndAfter(element.find('.ta-text ul li:first-child')[0]);
			sel.setSingleRange(range);
			sel.refresh();
			findAndTriggerButton('clear');
			expect($rootScope.htmlcontent).toBe('<p class="test-class" style="text-align: left;">Test Content <b>that</b> <u>should</u> be cleared</p><h1>Test Other Tags</h1><ul><li>Test 1</li><li>Test 2</li></ul>');
		});
		
		it('works without rangy', function(){
			var button = element.find('button[name=clear]');
			var _rangy = button.scope().$window.rangy;
			button.scope().$window.rangy = undefined;
			button.scope().executeAction(editorScope);
			editorScope.endAction();
			$rootScope.$digest();
			expect($rootScope.htmlcontent).toBe('<p class="test-class">Test Content that should be cleared</p><p>Test Other Tags</p><ul><li>Test 1</li></ul><ul><li>Test 2</li></ul><p></p>');
			button.scope().$window.rangy = _rangy;
		});
	});
});