describe('textAngularToolbar', function(){
	'use strict';
	beforeEach(module('textAngular'));
	beforeEach(inject(function(taRegisterTool, taOptions){
		// add a tool that is ALLWAYS active
		taRegisterTool('active', {
			buttontext: 'Allways Active',
			action: function(){
				return this.$editor().wrapSelection("formatBlock", "<P>");
			},
			activeState: function(){ return true; }
		});
		taOptions.toolbar = [
			['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote', 'active'],
			['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
			['justifyLeft','justifyCenter','justifyRight'],
			['html', 'insertImage', 'insertLink', 'unlink']
		];
	}));
	describe('initiation', function(){
		describe('requires a name attribute', function(){
			it('errors when missing', inject(function($rootScope, $compile){
				expect(function(){
					$compile('<text-angular-toolbar></text-angular-toolbar>')($rootScope);
				}).toThrow('textAngular Error: A toolbar requires a name');
			}));
		});
		
		describe('respects the taToolbar attribute compiled string', function(){
			it('should output the correct toolbar', inject(function($rootScope, $compile){
				var element = $compile('<text-angular-toolbar name="test" ta-toolbar="[[\'h1\',\'h2\',\'h3\',\'h4\',\'h5\',\'h6\']]"></text-angular-toolbar>')($rootScope);
				expect(jQuery('button', element).length).toBe(6);
			}));
		});
		
		describe('respects the taToolbar attribute variable name', function(){	
			it('should output the correct toolbar', inject(function($rootScope, $compile){
				$rootScope.toolbar = [['h1','h2','h3','h4','h5','h6']];
				var element = $compile('<text-angular-toolbar name="test" ta-toolbar="toolbar"></text-angular-toolbar>')($rootScope);
				expect(jQuery('button', element).length).toBe(6);
			}));
		});
		
		describe('respects the Class attribute taToolbarClass', function(){
			it('on the toolbar', inject(function($rootScope, $compile){
				var element = $compile('<text-angular-toolbar name="test" ta-toolbar-class="test-class"></text-angular-toolbar>')($rootScope);
				expect(jQuery('.test-class', element).length).toBe(0);
				expect(jQuery(element).hasClass('test-class'));
			}));
		});
			
		describe('respects the Class attribute taToolbarGroupClass', function(){
			it('on the toolbar group', inject(function($rootScope, $compile){
				var element = $compile('<text-angular-toolbar name="test" ta-toolbar-group-class="test-class"></text-angular-toolbar>')($rootScope);
				expect(jQuery('.test-class', element).length).toBe(4);
			}));
		});
		
		describe('respects the Class attribute taToolbarButtonClass', function(){
			it('adds to all buttons', inject(function($rootScope, $compile){
				var element = $compile('<text-angular-toolbar name="test" ta-toolbar-button-class="test-class"></text-angular-toolbar>')($rootScope);
				expect(jQuery('button:not(.test-class)', element).length).toBe(0);
			}));
		});
		
		describe('respects the Class attribute taToolbarActiveButtonClass', function(){
			it('on an active button', inject(function($rootScope, $compile, textAngularManager){
				var element = $compile('<text-angular-toolbar name="test" ta-toolbar-active-button-class="test-class"></text-angular-toolbar>')($rootScope);
				var toolbarScope = textAngularManager.retrieveToolbar('test');
				toolbarScope.disabled = false;
				toolbarScope.focussed = true;
				angular.forEach(toolbarScope.tools, function(toolScope){
					if(toolScope.activeState){
						toolScope.active = toolScope.activeState();
					}
				});
				$rootScope.$digest();
				expect(jQuery('button.test-class', element).length).toBe(1);
			}));
		});
		
		describe('is added to the textAngularManager', function(){
			it('successfully', inject(function($rootScope, $compile, textAngularManager){
				$compile('<text-angular-toolbar name="test"></text-angular-toolbar>')($rootScope);
				expect(textAngularManager.retrieveToolbar('test')).not.toBeUndefined();
			}));
		});
	});
	
	describe('focussed class', function(){
		var $digest, element, toolbarScope;
		beforeEach(inject(function($rootScope, $compile, textAngularManager){
			element = $compile('<text-angular-toolbar name="test" ta-focussed-class="test-class"></text-angular-toolbar>')($rootScope);
			toolbarScope = textAngularManager.retrieveToolbar('test');
			toolbarScope.disabled = false;
			$digest = $rootScope.$digest;
		}));
		
		describe('initially not focussed', function(){
			it('should not have class', function(){
				expect(!jQuery(element).hasClass('test-class'));
			});
			
			it('should add class on focussed change', function(){
				toolbarScope.focussed = true;
				$digest();
				expect(jQuery(element).hasClass('test-class'));
			});
		});
	});
});

/*
					
					setupToolElement = function(toolElement, toolDefinition, toolScope){
						toolElement.addClass(scope.classes.toolbarButton);
						toolElement.attr('name', toolScope.name);
						// important to not take focus from the main text/html entry
						toolElement.attr('unselectable', 'on');
						toolElement.attr('ng-disabled', 'isDisabled()');
						toolElement.attr('tabindex', '-1');
						toolElement.attr('ng-click', 'executeAction()');
						toolElement.on('mousedown', function(e){
							// this prevents focusout from firing on the editor when clicking toolbar buttons
							e.preventDefault();
							return false;
						});
						if(toolDefinition){
							if(toolDefinition.buttontext) toolElement.html(toolDefinition.buttontext);
							if(toolDefinition.iconclass){
								var icon = angular.element('<i>'), content = toolElement.html();
								icon.addClass(toolDefinition.iconclass);
								toolElement.html('');
								toolElement.append(icon);
								toolElement.append('&nbsp;' + content);
							}
						}
						
						if(toolScope) return $compile(toolElement)(toolScope);
						else return toolElement;
					};
					
					// Keep a reference for updating the active states later
					scope.tools = {};
					// create the tools in the toolbar
					// default functions and values that don't change in each tool init these values prevent errors
					scope._parent = {
						disabled: true,
						showHtml: false
					};
					var defaultChildScope = {
						$editor: function(){
							// dynamically gets the editor as it is set
							return scope._parent;
						},
						isDisabled: function(){
							// to set your own disabled logic set a function or boolean on the tool called 'disabled'
							return ( // this bracket is important as without it it just returns the first bracket and ignores the rest
								// when the button's disabled function/value evaluates to true
								this.$eval('disabled') || this.$eval('disabled()') ||
								// all buttons except the HTML Switch button should be disabled in the showHtml (RAW html) mode
								(this.name !== 'html' && this.$editor().showHtml) ||
								// if the toolbar is disabled
								this.$parent.disabled ||
								// if the current editor is disabled
								this.$editor().disabled
							);
						},
						displayActiveToolClass: function(active){
							return (active)? this.$editor().classes.toolbarButtonActive : '';
						},
						executeAction: function(){
							var deferred = $q.defer(),
								promise = deferred.promise;
							promise['finally'](this.$editor().endAction);
							// pass into the action the deferred function and also the function to reload the current selection if rangy available
							var result = this.action(deferred, this.$editor().startAction());
							if(result || result === undefined){
								// if true or undefined is returned then the action has finished. Otherwise the deferred action will be resolved manually.
								deferred.resolve();
							}
						}
					};
							
					angular.forEach(scope.toolbar, function(group){
						// setup the toolbar group
						groupElement = angular.element("<div>");
						groupElement.addClass(scope.classes.toolbarGroup);
						angular.forEach(group, function(tool){
							// init and add the tools to the group
							// a tool name (key name from taTools struct)
							toolElement = angular.element(taTools[tool].display);
							//creates a child scope of the main angularText scope and then extends the childScope with the functions of this particular tool
							var childScope = angular.extend(scope.$new(true), taTools[tool], defaultChildScope, {name: tool});
							// reference to the scope kept
							scope.tools[tool] = childScope;
							// append the tool compiled with the childScope to the group element
							groupElement.append(setupToolElement(toolElement, taTools[tool], childScope));
							scope.tools[tool].$element = toolElement;
						});
						// append the group to the toolbar
						element.append(groupElement);
					});
					
					// update a tool
					// if a value is set to null, remove from the display, if it's undefined return to the taTools definition.
					// display is an exception whereby null will return it to the taTools definition and undefined will load the current one
					scope.updateToolDisplay = function(key, _newTool){
						var oldTool = taTools[key], toolInstance = scope.tools[key];
						if(toolInstance){
							// if tool is defined on this toolbar, update/redo the tool
							if(_newTool.buttontext === null){
								delete _newTool.buttontext;
							}else if(!_newTool.buttontext && oldTool.buttontext){
								_newTool.buttontext = oldTool.buttontext;
							}
							
							if(_newTool.iconclass === null){
								delete _newTool.iconclass;
							}else if(!_newTool.iconclass && oldTool.iconclass){
								_newTool.iconclass = oldTool.iconclass;
							}
							
							if(_newTool.display && _newTool.display !== ''){
								toolElement = angular.element(_newTool.display);
							}else if(_newTool.display === null){
								toolElement = angular.element(oldTool.display);
							}else{
								toolElement = toolInstance.$element;
							}
							
							toolElement = setupToolElement(toolElement, _newTool, toolInstance);
							toolInstance.$element.replaceWith(toolElement);
							toolInstance.$element = toolElement;
						}
					};
					
					textAngularManager.registerToolbar(scope);
				}
			};
		}
	])
	
	// functions for updating the toolbar buttons display
	updateToolsDisplay: function(newTaTools){
		// pass a partial struct of the taTools, this allows us to update the tools on the fly, will not change the defaults.
		var _this = this;
		angular.forEach(newTaTools, function(_newTool, key){
			_this.updateToolDisplay(key, _newTool);
		});
	},
	// this function resets all toolbars to their default tool definitions
	resetToolsDisplay: function(){
		var _this = this;
		angular.forEach(taTools, function(_newTool, key){
			_this.resetToolDisplay(key);
		});
	},
	// update a tool on all toolbars
	updateToolDisplay: function(toolKey, _newTool){
		var _this = this;
		angular.forEach(toolbars, function(toolbarScope, toolbarKey){
			_this.updateToolbarToolDisplay(toolbarKey, toolKey, _newTool);
		});
	},
	// resets a tool to the default/starting state on all toolbars
	resetToolDisplay: function(toolKey){
		var _this = this;
		angular.forEach(toolbars, function(toolbarScope, toolbarKey){
			_this.resetToolbarToolDisplay(toolbarKey, toolKey);
		});
	},
	// update a tool on a specific toolbar
	updateToolbarToolDisplay: function(toolbarKey, toolKey, _newTool){
		if(toolbars[toolbarKey]) toolbars[toolbarKey].updateToolDisplay(toolKey, _newTool);
	},
	// reset a tool on a specific toolbar to it's default starting value
	resetToolbarToolDisplay: function(toolbarKey, toolKey){
		if(toolbars[toolbarKey]) toolbars[toolbarKey].updateToolDisplay(toolKey, taTools[toolKey]);
	},
	// this is used when externally the html of an editor has been changed and textAngular needs to be notified to update the model.
	// this will call a $digest if not already happening
	refreshEditor: function(name){
		if(editors[name]){
			editors[name].scope.updateTaBindtaTextElement();
			if(!editors[name].scope.$$phase) editors[name].scope.$digest();
		}else throw('textAngular Error: No Editor with name "' + name + '" exists');
	}
*/