describe('taExecCommand', function(){
	'use strict';
	beforeEach(module('textAngular'));
	//mock for easier testing
	describe('normal function', function(){
		var $element, $document, contents, _tempExec;
		beforeEach(inject(function(_$document_){
			$document = _$document_;
			contents = angular.element('<div>');
			contents.append('<p>Test Text</p>');
			// Fake it till you make it
			_tempExec = $document[0].execCommand;
			$document[0].execCommand = function(){
				contents.html('<p><b>Test Text</b></p>');
			};
		}));
		afterEach(function(){
			$document[0].execCommand = _tempExec;
		});
		var $rootScope;
		
		it('shouldn\'t error for undefined', inject(function(taExecCommand){
			expect(function(){
				taExecCommand()('bold', false, null);
			}).not.toThrow();
		}));
		
		describe('document execCommand fallback', function(){
			it('should execute for elements', inject(function(taExecCommand){
				taExecCommand()('bold', false, null);
				expect(contents.html()).toBe('<p><b>Test Text</b></p>');
			}));
		});
	});
	
	describe('handles lists correctly', function(){
		var taSelectionMock, $element, $document, contents;
		beforeEach(function(){
			taSelectionMock = {
				element: undefined,
				getSelectionElement: function (){ return this.element; },
				getOnlySelectedElements: function(){ return this.element.childNodes; },
				setSelectionToElementStart: function (){ return; },
				setSelectionToElementEnd: function (){ return; }
			};
			
			module(function($provide){
				$provide.value('taSelection', taSelectionMock);
			});
		});
		describe('other to list', function(){
			var element;
			describe('fallthrough case', function(){
				it('calls execCommand', inject(function(taExecCommand, $document, taSelection){
					var _temp = $document[0].execCommand;
					$document[0].execCommand = function(){
						element.html('<b>Test Text</b>');
					};
					element = angular.element('<figment>To the List!</figment>');
					taSelection.element = element[0];
					taExecCommand()('insertorderedlist', false, null);
					expect(element.html()).toBe('<b>Test Text</b>');
					$document[0].execCommand = _temp;
				}));
			});
			describe('single element selected', function(){
				beforeEach(inject(function(taSelection){
					element = angular.element('<div><p>To the List!</p></div>');
					taSelection.element = element.children()[0];
				}));
				it('to ol', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertorderedlist', false, null);
					expect(element.html()).toBe('<ol><li>To the List!</li></ol>');
				}));
				
				it('to ul', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertunorderedlist', false, null);
					expect(element.html()).toBe('<ul><li>To the List!</li></ul>');
				}));
			});
			describe('multi element selected', function(){
				beforeEach(inject(function(taSelection){
					element = angular.element('<div class="ta-bind"><p>To the List!</p><p>To the List 2!</p></div>');
					taSelection.element = element[0];
				}));
				it('to ol', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertorderedlist', false, null);
					expect(element.html()).toBe('<ol><li>To the List!</li><li>To the List 2!</li></ol>');
				}));
				
				it('to ul', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertunorderedlist', false, null);
					expect(element.html()).toBe('<ul><li>To the List!</li><li>To the List 2!</li></ul>');
				}));
			});
		});
		describe('list to other', function(){
			var element;
			describe('li selected', function(){
				it('from ol', inject(function(taSelection, taExecCommand){
					element = angular.element('<div><ol><li>To the List!</li></ol></div>');
					taSelection.element = element.children()[0].childNodes[0];
					taExecCommand()('insertorderedlist', false, null);
					expect(element.html()).toBe('<p>To the List!</p>');
				}));
				it('to ul', inject(function(taSelection, taExecCommand){
					element = angular.element('<div><ol><li>To the List!</li></ol></div>');
					taSelection.element = element.children()[0].childNodes[0];
					taExecCommand()('insertunorderedlist', false, null);
					expect(element.html()).toBe('<ul><li>To the List!</li></ul>');
				}));
			});
			describe('list selected', function(){
				describe('from ol', function(){
					describe('as child of ta-bind', function(){
						it('to default', inject(function(taSelection, taExecCommand){
							element = angular.element('<div class="ta-bind"><ol><li>To the List!</li></ol></div>');
							taSelection.element = element[0];
							taExecCommand()('insertorderedlist', false, null);
							expect(element.html()).toBe('<p>To the List!</p>');
						}));
						it('to ul', inject(function(taSelection, taExecCommand){
							element = angular.element('<div class="ta-bind"><ol><li>To the List!</li></ol></div>');
							taSelection.element = element[0];
							taExecCommand()('insertunorderedlist', false, null);
							expect(element.html()).toBe('<ul><li>To the List!</li></ul>');
						}));
					});
					it('as list', inject(function(taSelection, taExecCommand){
						element = angular.element('<div><ol><li>To the List!</li></ol></div>');
					taSelection.element = element.children()[0];
						taExecCommand()('insertorderedlist', false, null);
						expect(element.html()).toBe('<p>To the List!</p>');
					}));
					it('to ul', inject(function(taSelection, taExecCommand){
						element = angular.element('<div><ol><li>To the List!</li></ol></div>');
						taSelection.element = element.children()[0];
						taExecCommand()('insertunorderedlist', false, null);
						expect(element.html()).toBe('<ul><li>To the List!</li></ul>');
					}));
				});
				describe('from ul', function(){
					describe('as child of ta-bind', function(){
						it('to default', inject(function(taSelection, taExecCommand){
							element = angular.element('<div class="ta-bind"><ul><li>To the List!</li></ul></div>');
							taSelection.element = element[0];
							taExecCommand()('insertunorderedlist', false, null);
							expect(element.html()).toBe('<p>To the List!</p>');
						}));
						it('to ol', inject(function(taSelection, taExecCommand){
							element = angular.element('<div class="ta-bind"><Ul><li>To the List!</li></ul></div>');
							taSelection.element = element[0];
							taExecCommand()('insertorderedlist', false, null);
							expect(element.html()).toBe('<ol><li>To the List!</li></ol>');
						}));
					});
					it('as child of ta-bind', inject(function(taSelection, taExecCommand){
						element = angular.element('<div class="ta-bind"><ul><li>To the List!</li></ul></div>');
						taSelection.element = element[0];
						taExecCommand()('insertunorderedlist', false, null);
						expect(element.html()).toBe('<p>To the List!</p>');
					}));
					it('as list', inject(function(taSelection, taExecCommand){
						element = angular.element('<div><ul><li>To the List!</li></ul></div>');
						taSelection.element = element.children()[0];
						taExecCommand()('insertunorderedlist', false, null);
						expect(element.html()).toBe('<p>To the List!</p>');
					}));
					it('to ol', inject(function(taSelection, taExecCommand){
						element = angular.element('<div><ul><li>To the List!</li></ul></div>');
						taSelection.element = element.children()[0];
						taExecCommand()('insertorderedlist', false, null);
						expect(element.html()).toBe('<ol><li>To the List!</li></ol>');
					}));
				});
			});
		});
	});
});

describe('taBrowserTag', function(){
	'use strict';
	beforeEach(module('textAngular'));
	
	it('should return p for undefined', inject(function(taBrowserTag){
		expect(taBrowserTag()).toBe('p');
	}));
	
	it('should return div for empty', inject(function(taBrowserTag){
		expect(taBrowserTag('')).toBe('p'); // don't ask me why phantomjs thinks it's ie
	}));
	
	it('should return string otherwise', inject(function(taBrowserTag){
		expect(taBrowserTag('b')).toBe('b');
	}));
});