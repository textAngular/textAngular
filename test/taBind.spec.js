describe('taBind', function () {
	'use strict';
	beforeEach(module('textAngular'));
	var $rootScope;

	it('should require ngModel', inject(function (_$compile_, _$rootScope_) {
		expect(function () {
			_$compile_('<div ta-bind></div>')(_$rootScope_);
			$rootScope.$digest();
		}).toThrow();
	}));

	describe('should respect HTML5 placeholder', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '';
			element = _$compile_('<textarea id="taTextElement" contenteditable="true" ta-bind="" ng-model="html" placeholder="Add Comment" class="ng-scope ng-isolate-scope ng-pristine ng-valid"></textarea>')($rootScope);
			$rootScope.$digest();
		}));

		it('should add the placeholder-text class', function () {
			expect(element.hasClass('placeholder-text')).toBe(true);
		});
		it('should add the placeholder text', function () {
			expect(element.text()).toEqual('Add Comment');
		});
		it('should remove the placeholder text on focusin', function () {
			element.triggerHandler('focus');
			expect(element.text()).toEqual('');
		});
		it('should remove the placeholder-text class on focusin', function () {
			element.triggerHandler('focus');
			expect(element.hasClass('placeholder-text')).toBe(false);
		});
		it('should add the placeholder text back on blur if the input is blank', function () {
			element.triggerHandler('focus');
			expect(element.text()).toEqual('');
			element.triggerHandler('blur');
			expect(element.text()).toEqual('Add Comment');
		});
		it('should add the placeholder-text class back on blur if the input is blank', function () {
			element.triggerHandler('focus');
			expect(element.hasClass('placeholder-text')).toBe(false);
			element.triggerHandler('blur');
			expect(element.hasClass('placeholder-text')).toBe(true);
		});
		it('should not add the placeholder text back on blur if the input is not blank', function () {
			element.triggerHandler('focus');
			expect(element.text()).toEqual('');
			element.text('Lorem Ipsum');
			element.triggerHandler('blur');
			expect(element.text()).toEqual('Lorem Ipsum');
		});
		it('should not add the placeholder-text class back on blur if the input is not blank', function () {
			element.triggerHandler('focus');
			expect(element.hasClass('placeholder-text')).toBe(false);
			element.text('Lorem Ipsum');
			element.triggerHandler('blur');
			expect(element.hasClass('placeholder-text')).toBe(false);
		});
	});

	describe('should function as a display div', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));

		it('should display model contents', function () {
			expect(element.html()).toBe('<p>Test Contents</p>');
		});
		it('should NOT update model from keyup', function () {
			element.html('<div>Test 2 Content</div>');
			element.triggerHandler('keyup');
			$rootScope.$digest();
			expect($rootScope.html).toBe('<p>Test Contents</p>');
		});
		it('should error on update model from update function', function () {
			element.html('<div>Test 2 Content</div>');
			expect(function () {
				$rootScope.updateTaBind();
			}).toThrow('textAngular Error: attempting to update non-editable taBind');
		});
		it('should update display from model change', function () {
			$rootScope.html = '<div>Test 2 Content</div>';
			$rootScope.$digest();
			expect(element.html()).toBe('<div>Test 2 Content</div>');
		});
	});

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
		
		it('should prevent links from being clicked', function () {
			$rootScope.html = '<div><a href="test">Test</a> 2 Content</div>';
			$rootScope.$digest();
			element.find('a').on('click', function(e){
				expect(e.isDefaultPrevented());
			});
			element.find('a').triggerHandler('click');
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
			element.trigger('blur');
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
			element.trigger('blur');
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

	describe('should update from cut and paste events', function () {
		var $rootScope, element, $timeout;
		beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_) {
			$rootScope = _$rootScope_;
			$timeout = _$timeout_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<textarea ta-bind ng-model="html"></textarea>')($rootScope);
			$rootScope.$digest();
		}));

		it('should update model from paste', function () {
			element.val('<div>Test 2 Content</div>');
			element.trigger('paste');
			$rootScope.$digest();
			$timeout.flush();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
		});

		it('should update model from cut', function () {
			element.val('<div>Test 2 Content</div>');
			element.trigger('cut');
			$timeout.flush();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<div>Test 2 Content</div>');
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

	describe('should use taSanitize to', function () {
		var $rootScope, element;
		beforeEach(inject(function (_$compile_, _$rootScope_) {
			$rootScope = _$rootScope_;
			$rootScope.html = '<p>Test Contents</p>';
			element = _$compile_('<div ta-bind contenteditable="contenteditable" ng-model="html"></div>')($rootScope);
			$rootScope.$digest();
		}));

		it('parse from change events', function () {
			element.append('<bad-tag>Test 2 Content</bad-tag>');
			$rootScope.updateTaBind();
			$rootScope.$digest();
			expect($rootScope.html).toBe('<p>Test Contents</p>Test 2 Content');
		});

		it('formatt from model change', function () {
			$rootScope.html += '<bad-tag>Test 2 Content</bad-tag>';
			$rootScope.$digest();
			expect(element.html()).toBe('<p>Test Contents</p>Test 2 Content');
		});
	});

	describe('should respect taReadonly value', function () {
		describe('initially true', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
		});

		describe('initially false', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).toBe('true');
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
		});


		describe('changed to true', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).toBe('disabled');
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = false;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = true;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
		});

		describe('changed to false', function () {
			it('as a textarea', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an input', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('disabled')).not.toBeDefined();
			}));
			it('as an editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).toBe('true');
			}));
			it('as an un-editable div', inject(function (_$compile_, _$rootScope_) {
				_$rootScope_.html = '<p>Test Contents</p>';
				_$rootScope_.readonly = true;
				var element = _$compile_('<div ta-bind ta-readonly="readonly" ng-model="html"></div>')(_$rootScope_);
				_$rootScope_.$digest();
				_$rootScope_.readonly = false;
				_$rootScope_.$digest();
				expect(element.attr('contenteditable')).not.toBeDefined();
			}));
		});

		describe('when true don\'t update model', function () {
			describe('from cut and paste events', function () {
				describe('on textarea', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model from paste', function () {
						element.val('<div>Test 2 Content</div>');
						element.trigger('paste');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});

					it('should update model from cut', function () {
						element.val('<div>Test 2 Content</div>');
						element.trigger('cut');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on input', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model from paste', function () {
						element.val('<div>Test 2 Content</div>');
						element.trigger('paste');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});

					it('should update model from cut', function () {
						element.val('<div>Test 2 Content</div>');
						element.trigger('cut');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on editable div', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model from paste', function () {
						element.html('<div>Test 2 Content</div>');
						element.trigger('paste');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});

					it('should update model from cut', function () {
						element.html('<div>Test 2 Content</div>');
						element.trigger('cut');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});

			describe('from updateTaBind function', function () {
				describe('on textarea', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model', function () {
						element.val('<div>Test 2 Content</div>');
						$rootScope.updateTaBind();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on input', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model', function () {
						element.val('<div>Test 2 Content</div>');
						$rootScope.updateTaBind();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on editable div', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model', function () {
						element.html('<div>Test 2 Content</div>');
						$rootScope.updateTaBind();
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});

			describe('from blur function', function () {
				describe('on textarea', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<textarea ta-bind ta-readonly="readonly" ng-model="html"></textarea>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model', function () {
						element.val('<div>Test 2 Content</div>');
						element.trigger('blur');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});

				describe('on input', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<input ta-bind ta-readonly="readonly" ng-model="html"/>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model', function () {
						element.val('<div>Test 2 Content</div>');
						element.trigger('blur');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});

			describe('from keyup function', function () {
				describe('on editable div', function () {
					var $rootScope, element;
					beforeEach(inject(function (_$compile_, _$rootScope_) {
						$rootScope = _$rootScope_;
						$rootScope.html = '<p>Test Contents</p>';
						$rootScope.readonly = true;
						element = _$compile_('<div ta-bind contenteditable="true" ta-readonly="readonly" ng-model="html"></div>')($rootScope);
						$rootScope.$digest();
					}));

					it('should update model', function () {
						element.html('<div>Test 2 Content</div>');
						element.trigger('keyup');
						$rootScope.$digest();
						expect($rootScope.html).toBe('<p>Test Contents</p>');
					});
				});
			});
		});
	});
});