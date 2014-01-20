describe('textAngularManager', function(){
	'use strict';
	beforeEach(module('textAngular'));
	
	describe('toolbar', function(){
		describe('registration', function(){
			it('should require a scope object', inject(function(textAngularManager){
				expect(textAngularManager.registerToolbar).toThrow("textAngular Error: A toolbar requires a scope");
			}));
			
			it('should require a name', inject(function(textAngularManager){
				expect(function(){textAngularManager.registerToolbar({});}).toThrow("textAngular Error: A toolbar requires a name");
				expect(function(){textAngularManager.registerToolbar({name: ''});}).toThrow("textAngular Error: A toolbar requires a name");
			}));
			
			it('should require a unique name', inject(function(textAngularManager){
				textAngularManager.registerToolbar({name: 'test'});
				expect(function(){textAngularManager.registerToolbar({name: 'test'});}).toThrow('textAngular Error: A toolbar with name "test" already exists');
			}));
		});
		
		describe('updating', function(){
			
		});
	});
	
	describe('editor', function(){
		describe('registration', function(){
			it('should require a name', inject(function(textAngularManager){
				expect(textAngularManager.registerEditor).toThrow("textAngular Error: An editor requires a name");
				expect(function(){textAngularManager.registerEditor('');}).toThrow("textAngular Error: An editor requires a name");
			}));
			
			it('should require a scope object', inject(function(textAngularManager){
				expect(function(){textAngularManager.registerEditor('test');}).toThrow("textAngular Error: An editor requires a scope");
			}));
			
			it('should require a unique name', inject(function(textAngularManager){
				textAngularManager.registerEditor('test', {});
				expect(function(){textAngularManager.registerEditor('test', {});}).toThrow('textAngular Error: An Editor with name "test" already exists');
			}));
			
			it('should return a disable function', inject(function(textAngularManager){
				expect(textAngularManager.registerEditor('test', {}).disable).toBeDefined();
			}));
			
			it('should return a enable function', inject(function(textAngularManager){
				expect(textAngularManager.registerEditor('test', {}).enable).toBeDefined();
			}));
			
			it('should return a focus function', inject(function(textAngularManager){
				expect(textAngularManager.registerEditor('test', {}).focus).toBeDefined();
			}));
			
			it('should return a unfocus function', inject(function(textAngularManager){
				expect(textAngularManager.registerEditor('test', {}).unfocus).toBeDefined();
			}));
			
			it('should return a updateSelectedStyles function', inject(function(textAngularManager){
				expect(textAngularManager.registerEditor('test', {}).updateSelectedStyles).toBeDefined();
			}));
		});
		
		describe('updating', function(){
			var $rootScope, element;
			beforeEach(inject(function (_$compile_, _$rootScope_) {
				$rootScope = _$rootScope_;
				$rootScope.htmlcontent = '<p>Test Content</p>';
				element = _$compile_('<text-angular name="test" ng-model="htmlcontent"></text-angular>')($rootScope);
				$rootScope.$digest();
			}));
			it('should throw error for named editor that doesn\'t exist', inject(function(textAngularManager){
				expect(function(){textAngularManager.refreshEditor('non-editor');}).toThrow('textAngular Error: No Editor with name "non-editor" exists');
			}));
			it('should update from text view to model', inject(function(textAngularManager){
				jQuery('.ta-text', element).append('<div>Test 2 Content</div>');
				textAngularManager.refreshEditor('test');
				expect($rootScope.htmlcontent).toBe('<p>Test Content</p><div>Test 2 Content</div>');
			}));
		});
	});
});

/*
	}]).service('textAngularManager', [function(){ // this service is used to manage all textAngular editors and toolbars. All publicly published functions that modify/need to access the toolbar or editor scopes should be in here
		// these contain references to all the editors and toolbars that have been initialised in this app
		var toolbars = {}, editors = {};
		// when we focus into a toolbar, we need to set the TOOLBAR's $parent to be the toolbars it's linked to. We also need to set the tools to be updated to be the toolbars...
		return {
			// register an editor and the toolbars that it is affected by
			registerEditor: function(name, scope, targetToolbars){
				if(editors[name]) throw ('textAngular Error: an Editor with name "' + name + '" already exists');
				var _toolbars = [];
				angular.forEach(targetToolbars, function(_name){
					if(!_toolbars[_name]) _toolbars.push(toolbars[_name]);
					// if it doesn't exist it may not have been compiled yet and it will be added later
				});
				editors[name] = {
					scope: scope,
					toolbars: targetToolbars,
					_registerToolbar: function(toolbarScope){ // add to the list late
						if(this.toolbars.indexOf(toolbarScope.name) >= 0) _toolbars.push(toolbarScope);
					}
				};
				return {
					disable: function(){ angular.forEach(_toolbars, function(toolbarScope){ toolbarScope.disabled = true; }); },
					enable: function(){ angular.forEach(_toolbars, function(toolbarScope){ toolbarScope.disabled = false; }); },
					focus: function(){ // this should be called when the editor is focussed
						angular.forEach(_toolbars, function(toolbarScope){
							toolbarScope._parent = scope;
							toolbarScope.disabled = false;
						});
					},
					unfocus: function(){ return this.disable(); }, // this should be called when the editor becomes unfocussed
					updateSelectedStyles: function(){
						angular.forEach(_toolbars, function(toolbarScope){
							angular.forEach(toolbarScope.tools, function(toolScope){
								if(toolScope.activeState){
									toolScope.active = toolScope.activeState(scope);
								}
							});
						});
					}
				};
			}
			// functions for updating the toolbar buttons display
			updateTools: function(newTaTools){ // pass a partial struct of the taTools, this allows us to update the tools on the fly.
				var _this = this;
				angular.forEach(newTaTools, function(_newTool, key){
					_this.updateTool(key, _newTool);
				});
			},
			resetTools: function(){
				var _this = this;
				angular.forEach(taTools, function(_newTool, key){
					_this.resetTool(key);
				});
			},
			// update a tool on all toolbars
			updateTool: function(toolKey, _newTool){
				var _this = this;
				angular.forEach(toolbars, function(toolbarScope, toolbarKey){
					_this.updateToolbarTool(toolbarKey, toolKey, _newTool);
				});
			},
			// resets a tool to the default/starting state
			resetTool: function(toolKey){
				var _this = this;
				angular.forEach(toolbars, function(toolbarScope, toolbarKey){
					_this.resetToolbarTool(toolbarKey, toolKey, taTools[toolKey]);
				});
			},
			updateToolbarTool: function(toolbarKey, toolKey, _newTool){
				if(toolbars[toolbarKey]) toolbars[toolbarKey].updateTool(toolKey, _newTool);
			},
			resetToolbarTool: function(toolbarKey, toolKey){
				if(toolbars[toolbarKey]) toolbars[toolbarKey].updateTool(toolKey, taTools[toolKey]);
			}
		};
	}]);
*/