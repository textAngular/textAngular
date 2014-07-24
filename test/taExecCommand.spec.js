describe('taExecCommand', function(){
	'use strict';
	var $element;
	beforeEach(module('textAngular'));
	//mock for easier testing
	describe('normal function', function(){
		var $document, contents, _tempExec;
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
	
	describe('handles formatBlock BLOCKQUOTE correctly', function(){
		beforeEach(function(){
			module(function($provide){
				$provide.value('taSelection', {
					element: undefined,
					getSelectionElement: function (){ return this.element; },
					getOnlySelectedElements: function(){ return [].slice.call(this.element.childNodes); },
					setSelectionToElementStart: function (){ return; },
					setSelectionToElementEnd: function (){ return; }
				});
			});
		});
		// in li element
		// in non-block element, ie <b>
		// in block element, <p>
		// multiple selected including text elements
		// only text selected (collapsed range selection)
		
		// all wrap and unwrap
		describe('wraps elements', function(){
			describe('doesn\'t split lists', function(){
				it('li selected', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><ul><li>Test</li></ul></div>');
					taSelection.element = $element.find('li')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<blockquote><ul><li>Test</li></ul></blockquote>');
				}));
				it('ul selected', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><ul><li>Test</li></ul></div>');
					taSelection.element = $element.find('ul')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<blockquote><ul><li>Test</li></ul></blockquote>');
				}));
				it('ol selected', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><ol><li>Test</li></ol></div>');
					taSelection.element = $element.find('ol')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<blockquote><ol><li>Test</li></ol></blockquote>');
				}));
			});
			describe('wraps non-list elements', function(){
				it('no selection - single space', inject(function($document, taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><p><b>Test</b></p></div>');
					$document.find('body').append($element);
					taSelection.element = $element.find('b')[0];
					taSelection.getOnlySelectedElements = function(){ return []; };
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<blockquote><p><b>Test</b></p></blockquote>');
					$element.remove();
				}));
				it('nested selection', inject(function($document, taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><p><i><b>Test</b></i></p></div>');
					$document.find('body').append($element);
					taSelection.element = $element.find('b')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<blockquote><p><i><b>Test</b></i></p></blockquote>');
					$element.remove();
				}));
				it('selection with mixed nodes', inject(function($document, taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><p>Some <b>test</b> content</p></div>');
					$document.find('body').append($element);
					taSelection.element = $element.find('b')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<blockquote><p>Some <b>test</b> content</p></blockquote>');
					$element.remove();
				}));
			});
		});
		describe('unwraps elements', function(){
			describe('doesn\'t split lists', function(){
				it('li selected', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><blockquote><ul><li>Test</li></ul></blockquote></div>');
					taSelection.element = $element.find('li')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<ul><li>Test</li></ul>');
				}));
				it('ul selected', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><blockquote><ul><li>Test</li></ul></blockquote></div>');
					taSelection.element = $element.find('ul')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<ul><li>Test</li></ul>');
				}));
				it('ol selected', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><blockquote><ol><li>Test</li></ol></blockquote></div>');
					taSelection.element = $element.find('ol')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<ol><li>Test</li></ol>');
				}));
			});
			describe('unwraps non-list elements', function(){
				beforeEach(inject(function($document){
					$element = angular.element('<div class="ta-bind"><blockquote><p><b>Test</b></p></blockquote></div>');
					$document.find('body').append($element);
				}));
				afterEach(inject(function($document){
					$element.remove();
				}));
				it('no selection - single space', inject(function(taExecCommand, taSelection){
					taSelection.element = $element.find('b')[0];
					taSelection.getOnlySelectedElements = function(){ return []; };
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<p><b>Test</b></p>');
				}));
				it('inline selected', inject(function(taExecCommand, taSelection){
					taSelection.element = $element.find('b')[0];
					taSelection.getOnlySelectedElements = function(){ return taSelection.element.childNodes; };
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<p><b>Test</b></p>');
				}));
				it('block selected', inject(function(taExecCommand, taSelection){
					taSelection.element = $element.find('blockquote')[0];
					taSelection.getOnlySelectedElements = function(){ return taSelection.element; };
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<p><b>Test</b></p>');
				}));
			});
			describe('unwraps inline elements', function(){
				it('just inline element', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><blockquote><b>Test</b></blockquote></div>');
					taSelection.element = $element.find('b')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<p><b>Test</b></p>');
				}));
				it('inline and text element', inject(function(taExecCommand, taSelection){
					$element = angular.element('<div class="ta-bind"><blockquote>Other <b>Test</b></blockquote></div>');
					taSelection.element = $element.find('blockquote')[0];
					taExecCommand()('formatBlock', false, '<BLOCKQUOTE>');
					expect($element.html()).toBe('<p>Other <b>Test</b></p>');
				}));
			});
		});
	});

	describe('handles formatBlock correctly for other elements', function(){
		var $document, taExecCommand, taSelection;
		beforeEach(function(){
			module(function($provide){
				$provide.value('taSelection', {
					element: undefined,
					getSelectionElement: function (){ return this.element; },
					getOnlySelectedElements: function(){ return [].slice.call(this.element.childNodes); },
					setSelectionToElementStart: function (){ return; },
					setSelectionToElementEnd: function (){ return; }
				});
			});
		});
		beforeEach(inject(function(_$document_, _taExecCommand_, _taSelection_){
			$document = _$document_;
			taExecCommand = _taExecCommand_;
			taSelection = _taSelection_;
		}));
		function setupElement(html){
			$element = angular.element(html);
			$document.find('body').append($element);
		}
		afterEach(function(){
			$element.remove();
		});

		describe('heading tags', function(){
			it('can be unwrapped', function(){
				setupElement('<div class="ta-bind"><h1><b>Test</b></h1></div>');
				taSelection.element = $element.find('b')[0];
				taExecCommand()('formatBlock', false, '<H1>');
				expect($element.html()).toBe('<p><b>Test</b></p>');
			});
			describe('wrapping', function(){
				it('single block element', function(){
					setupElement('<div class="ta-bind"><p>Test</p></div>');
					taSelection.element = $element.find('p')[0];
					taExecCommand()('formatBlock', false, '<H1>');
					expect($element.html()).toBe('<h1>Test</h1>');
				});
				it('single block element with an inline element', function(){
					setupElement('<div class="ta-bind"><p><b>Test</b></p></div>');
					taSelection.element = $element.find('p')[0];
					taExecCommand()('formatBlock', false, '<H1>');
					expect($element.html()).toBe('<h1><b>Test</b></h1>');
				});
				it('replaces each selected block element', function(){
					setupElement('<div class="ta-bind"><p><b>Test</b></p><p>Line two</p><p>Line three</p></div>');
					taSelection.element = $element[0];
					// Select the first two p elements
					taSelection.getOnlySelectedElements = function(){ return [].slice.call(this.element.childNodes, 0, 2); };
					taExecCommand()('formatBlock', false, '<H1>');
					expect($element.html()).toBe('<h1><b>Test</b></h1><h1>Line two</h1><p>Line three</p>');
				});
				it('wraps all nodes for mixed nodes', function(){
					setupElement('<div class="ta-bind"><em>Italic</em>text<p><b>Test</b> content</p>In between<p>Line two</p></div>');
					taSelection.element = $element[0];
					taExecCommand()('formatBlock', false, '<H1>');
					expect($element.html()).toBe('<h1><em>Italic</em>text<p><b>Test</b> content</p>In between<p>Line two</p></h1>');
				});
			});
		});
	});
	
	describe('handles lists correctly', function(){
		var taSelectionMock, $document, contents;
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
			describe('element with block tagname as text', function(){
				beforeEach(inject(function(taSelection){
					element = angular.element('<div><p>This is not a div</p></div>');
					taSelection.element = element.children()[0];
				}));
				it('to ol', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertorderedlist', false, null);
					expect(element.html()).toBe('<ol><li>This is not a div</li></ol>');
				}));
				
				it('to ul', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertunorderedlist', false, null);
					expect(element.html()).toBe('<ul><li>This is not a div</li></ul>');
				}));
			});
			describe('element containing span', function(){
				beforeEach(inject(function(taSelection){
					element = angular.element('<div><p>To the List!<span></span></p></div>');
					taSelection.element = element.children()[0];
				}));
				it('to ol', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertorderedlist', false, null);
					expect(element.html()).toBe('<ol><li>To the List!<span></span></li></ol>');
				}));
				
				it('to ul', inject(function(taSelection, taExecCommand){
					taExecCommand()('insertunorderedlist', false, null);
					expect(element.html()).toBe('<ul><li>To the List!<span></span></li></ul>');
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
			describe('multi element selected within block element', function(){
				beforeEach(inject(function(taSelection){
					element = angular.element('<div class="ta-bind"><blockquote><p>To the List!</p><p>To the List 2!</p></blockquote></div>');
					taSelection.element = element.find('blockquote')[0];
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