/*
textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.2.0

See README.md or https://github.com/fraywing/textAngular/wiki for requirements and use.
*/

(function(){ // encapsulate all variables so they don't become global vars
	"Use Strict";
	var textAngular = angular.module("textAngular", ['ngSanitize']); //This makes ngSanitize required
	
	// Here we set up the global display defaults, to set your own use a angular $provider#decorator.
	textAngular.value('taOptions', {
		toolbar: [
			['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
			['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
			['justifyLeft','justifyCenter','justifyRight'],
			['html', 'insertImage', 'insertLink', 'unlink']
		],
		classes: {
			focussed: "focussed",
			toolbar: "btn-toolbar",
			toolbarGroup: "btn-group",
			toolbarButton: "btn btn-default",
			toolbarButtonActive: "active",
			disabled: "disabled",
			textEditor: 'form-control',
			htmlEditor: 'form-control'
		}
	});
	
	// setup the global contstant functions for setting up the toolbar
	
	var taTools = {}; // all tool definitions
	/*
		A tool definition is an object with the following key/value parameters:
			display: [string]
					an HTML element to be displayed as the buton. The `scope` of the button is the tool definition object with some additional functions
			action: [function(deferred, restoreSelection)]
					a function that is executed on clicking on the button - this will allways be executed using ng-click and will
					overwrite any ng-click value in the display attribute.
					The function is passed a deferred object ($q.defer()), if this is wanted to be used `return false;` from the action and
					manually call `deferred.resolve();` elsewhere to notify the editor that the action has finished.
					restoreSelection is only defined if the rangy library is included and it can be called as `restoreSelection()` to restore the users
					selection in the WYSIWYG editor.
			buttontext: [string]?
					if this is defined it will replace the contents of the element contained in the `display` element
			iconclass: [string]?
					if this is defined an icon (<i>) will be appended to the `display` element with this string as it's class
			activestate: [function(commonElement)]?
					this function is called on every caret movement, if it returns true then the class taOptions.classes.toolbarButtonActive
					will be applied to the `display` element, else the class will be removed
					If the rangy library is loaded commonElement will be an angular.element object that contains ALL of the selection.
			disabled: [function()]?
					if this function returns true then the tool will have the class taOptions.classes.disabled applied to it, else it will be removed
		Other functions available on the scope are:
			displayActiveToolClass: [function(boolean)] 
			name: [string]
					the name of the tool, this is the first parameter passed into taRegisterTool
			isDisabled: [function()]
					returns true if the tool is disabled, false if it isn't
			displayActiveToolClass: [function()]
					returns true if the tool is 'active' in the currently focussed toolbar
	*/
	// name and toolDefinition to add into the tools available to be added on the toolbar
	function registerTextAngularTool(name, toolDefinition){
		if(!name || name === '') throw('textAngular Error: A name is required for a Tool Definition');
		if(!toolDefinition.display || toolDefinition.display === '' || angular.element(toolDefinition.display).length === 0)
			throw('textAngular Error: Tool Definition for "' + name + '" does not have a valid display value');
		taTools[name] = toolDefinition;
	}
	
	textAngular.constant('taRegisterTool', registerTextAngularTool);
	
	// The activeState function is invoked on the textAngular scope, not the tool scope.
	// All the other functions are called on the tool scope, a child scope of the main textAngular scope.
	textAngular.value('taTools', taTools);
	
	// configure initial textAngular tools here via taRegisterTool
	textAngular.config(['taRegisterTool', function(taRegisterTool){
		taRegisterTool("html", {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			buttontext: 'Toggle HTML',
			action: function(){
				this.$editor().switchView();
			},
			activeState: function(){
				return this.$editor().showHtml;
			}
		});
		// add the Header tools
		// convenience functions so that the loop works correctly
		var _retActiveStateFunction = function(q){
			return function(){ return this.$editor().queryFormatBlockState(q); };
		};
		var headerAction = function(){
			return this.$editor().wrapSelection("formatBlock", "<" + this.name.toUpperCase() +">");
		};
		angular.forEach(['h1','h2','h3','h4','h5','h6'], function(h){
			taRegisterTool(h.toLowerCase(), {
				display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
				buttontext: h.toUpperCase(),
				action: headerAction,
				activeState: _retActiveStateFunction(h.toLowerCase())
			});
		});
		taRegisterTool('p', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			buttontext: 'P',
			action: function(){
				return this.$editor().wrapSelection("formatBlock", "<P>");
			},
			activeState: function(){ return this.$editor().queryFormatBlockState('p'); }
		});
		taRegisterTool('pre', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			buttontext: 'pre',
			action: function(){
				return this.$editor().wrapSelection("formatBlock", "<PRE>");
			},
			activeState: function(){ return this.$editor().queryFormatBlockState('pre'); }
		});
		taRegisterTool('ul', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-list-ul',
			action: function(){
				return this.$editor().wrapSelection("insertUnorderedList", null);
			},
			activeState: function(){ return document.queryCommandState('insertUnorderedList'); }
		});
		taRegisterTool('ol', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-list-ol',
			action: function(){
				return this.$editor().wrapSelection("insertOrderedList", null);
			},
			activeState: function(){ return document.queryCommandState('insertOrderedList'); }
		});
		taRegisterTool('quote', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-quote-right',
			action: function(){
				return this.$editor().wrapSelection("formatBlock", "<BLOCKQUOTE>");
			},
			activeState: function(){ return this.$editor().queryFormatBlockState('blockquote'); }
		});
		taRegisterTool('undo', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-undo',
			action: function(){
				return this.$editor().wrapSelection("undo", null);
			}
		});
		taRegisterTool('redo', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-repeat',
			action: function(){
				return this.$editor().wrapSelection("redo", null);
			}
		});
		taRegisterTool('bold', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-bold',
			action: function(){
				return this.$editor().wrapSelection("bold", null);
			},
			activeState: function(){
				return document.queryCommandState('bold');
			}
		});
		taRegisterTool('justifyLeft', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-align-left',
			action: function(){
				return this.$editor().wrapSelection("justifyLeft", null);
			},
			activeState: function(commonElement){
				var result = true;
				if(commonElement) result = commonElement.css('text-align') === 'left' || commonElement.css('text-align') === '';
				result = result || document.queryCommandState('justifyLeft');
				return result;
			}
		});
		taRegisterTool('justifyRight', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-align-right',
			action: function(){
				return this.$editor().wrapSelection("justifyRight", null);
			},
			activeState: function(commonElement){
				var result = true;
				if(commonElement) result = commonElement.css('text-align') === 'right';
				result = result || document.queryCommandState('justifyRight');
				return result;
			}
		});
		taRegisterTool('justifyCenter', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-align-center',
			action: function(){
				return this.$editor().wrapSelection("justifyCenter", null);
			},
			activeState: function(commonElement){
				var result = true;
				if(commonElement) result = commonElement.css('text-align') === 'center';
				result = result || document.queryCommandState('justifyCenter');
				return result;
			}
		});
		taRegisterTool('italics', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-italic',
			action: function(){
				return this.$editor().wrapSelection("italic", null);
			},
			activeState: function(){
				return document.queryCommandState('italic');
			}
		});
		taRegisterTool('underline', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-underline',
			action: function(){
				return this.$editor().wrapSelection("underline", null);
			},
			activeState: function(){
				return document.queryCommandState('underline');
			}
		});
		taRegisterTool('clear', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-ban',
			action: function(){
				return this.$editor().wrapSelection("removeFormat", null);
			}
		});
		taRegisterTool('insertImage', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-picture-o',
			action: function(){
				var imageLink;
				imageLink = prompt("Please enter an image URL to insert", 'http://');
				if(imageLink !== '' && imageLink !== 'http://'){
					return this.$editor().wrapSelection('insertImage', imageLink);
				}
			}
		});
		taRegisterTool('insertLink', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-link',
			action: function(){
				var urlLink;
				urlLink = prompt("Please enter an URL to insert", 'http://');
				if(urlLink !== '' && urlLink !== 'http://'){
					return this.$editor().wrapSelection('createLink', urlLink);
				}
			},
			activeState: function(commonElement){
				if(commonElement) return commonElement[0].tagName === 'A';
				return false;
			}
		});
		taRegisterTool('unlink', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-unlink',
			action: function(){
				return this.$editor().wrapSelection('unlink', null);
			},
			activeState: function(commonElement){
				if(commonElement) return commonElement[0].tagName === 'A';
				return false;
			}
		});
	}]);
	
	textAngular.directive("textAngular", [
		'$compile', '$timeout', '$log', 'taOptions', 'taSanitize', 'textAngularManager',
		function($compile, $timeout, $log, taOptions, taSanitize, textAngularManager){
			$log.info("Thank you for using textAngular! http://www.textangular.com");
			return {
				require: '?ngModel',
				scope: {},
				restrict: "EA",
				link: function(scope, element, attrs, ngModel){
					// all these vars should not be accessable outside this directive
					var _keydown, _keyup, _mouseup, _originalContents, _toolbars,
						_serial = Math.floor(Math.random() * 10000000000000000),
						_name = (attrs.name) ? attrs.name : 'textAngularEditor' + _serial;
					// get the settings from the defaults and add our specific functions that need to be on the scope
					angular.extend(scope, taOptions, {
						// wraps the selection in the provided tag / execCommand function.
						wrapSelection: function(command, opt){
							document.execCommand(command, false, opt);
							// refocus on the shown display element, this fixes a display bug when using :focus styles to outline the box.
							// You still have focus on the text/html input it just doesn't show up
							if(scope.showHtml) scope.displayElements.html[0].focus();
							else scope.displayElements.text[0].focus();
						},
						showHtml: false
					});
					// setup the options from the optional attributes
					if(attrs.taFocussedClass)			scope.classes.focussed = scope.$eval(attrs.taFocussedClass);
					if(attrs.taTextEditorClass)			scope.classes.textEditor = attrs.taTextEditorClass;
					if(attrs.taHtmlEditorClass)			scope.classes.htmlEditor = attrs.taHtmlEditorClass;
					
					_originalContents = element.html();
					// clear the original content
					element.html('');
					
					// Setup the HTML elements as variable references for use later
					scope.displayElements = {
						// we still need the hidden input even with a textarea as the textarea may have invalid/old input in it,
						// wheras the input will ALLWAYS have the correct value.
						forminput: angular.element("<input type='hidden' tabindex='-1' style='display: none;'>"),
						html: angular.element("<textarea id='taHtmlElement' ng-show='showHtml' ta-bind ng-model='html'></textarea>"),
						text: angular.element("<div id='taTextElement' contentEditable='true' ng-hide='showHtml' ta-bind ng-model='html'></div>")
					};
					
					// add the main elements to the origional element
					element.append(scope.displayElements.text);
					element.append(scope.displayElements.html);
					
					scope.displayElements.forminput.attr('name', _name);
					element.append(scope.displayElements.forminput);
					
					if(attrs.tabindex){
						scope.displayElements.text.attr('tabindex', attrs.tabindex);
						scope.displayElements.html.attr('tabindex', attrs.tabindex);
					}
					
					if(attrs.taDisabled){
						scope.displayElements.text.attr('ta-readonly', 'disabled');
						scope.displayElements.html.attr('ta-readonly', 'disabled');
						scope.disabled = scope.$parent.$eval(attrs.taDisabled);
						scope.$parent.$watch(attrs.taDisabled, function(newVal){
							scope.disabled = newVal;
							if(scope.disabled){
								element.addClass(scope.classes.disabled);
							}else{
								element.removeClass(scope.classes.disabled);
							}
						});
					}
					
					// compile the scope with the text and html elements only - if we do this with the main element it causes a compile loop
					$compile(scope.displayElements.text)(scope);
					$compile(scope.displayElements.html)(scope);
					
					// add the classes manually last
					element.addClass("ta-root");
					scope.displayElements.text.addClass("ta-text ta-editor " + scope.classes.textEditor);
					scope.displayElements.html.addClass("ta-html ta-editor " + scope.classes.textEditor);
					
					// used in the toolbar actions
					scope._actionRunning = false;
					var _savedSelection = false;
					scope.startAction = function(){
						scope._actionRunning = true;
						// if rangy library is loaded return a function to reload the current selection
						if(window.rangy && window.rangy.saveSelection){
							_savedSelection = window.rangy.saveSelection();
							return function(){
								window.rangy.restoreSelection(_savedSelection);
							};
						}
					};
					scope.endAction = function(){
						scope._actionRunning = false;
						if(_savedSelection) rangy.removeMarkers(_savedSelection);
						_savedSelection = false;
						scope.updateSelectedStyles();
						// only update if in text or WYSIWYG mode
						if(!scope.showHtml) scope.updateTaBindtaTextElement();
					};
					
					// note that focusout > focusin is called everytime we click a button
					// cascades to displayElements.text and displayElements.html automatically.
					element.on('focusin', function(){
						element.addClass(scope.classes.focussed);
						_toolbars.focus();
						// $timeout to prevent multiple apply error defer to next seems to work.
						$timeout(function(){
							// bubble the focus specifically to the active element
							if(scope.showHtml) scope.displayElements.html[0].focus();
							else scope.displayElements.text[0].focus();
						}, 0);
					});
					element.on('focusout', function(e){
						$timeout(function(){
							// if we have NOT focussed again on the text etc then fire the blur events
							if(document.activeElement !== scope.displayElements.html[0] && document.activeElement !== scope.displayElements.text[0]){
								element.removeClass(scope.classes.focussed);
								if(!scope._actionRunning) _toolbars.unfocus();
								// to prevent multiple apply error defer to next seems to work.
								$timeout(function(){ element.triggerHandler('blur'); }, 0);
							}
						}, 100);
						e.preventDefault();
						return false;
					});
					
					// Setup the default toolbar tools, this way allows the user to add new tools like plugins.
					// This is on the editor for future proofing if we find a better way to do this.
					scope.queryFormatBlockState = function(command){
						command = command.toLowerCase();
						var val = document.queryCommandValue('formatBlock').toLowerCase();
						return val === command || val === command;
					};
					scope.switchView = function(){
						scope.showHtml = !scope.showHtml;
						//Show the HTML view
						if(scope.showHtml){
							//defer until the element is visible
							$timeout(function(){
								// [0] dereferences the DOM object from the angular.element
								return scope.displayElements.html[0].focus();
							}, 100);
						}else{
							//Show the WYSIWYG view
							//defer until the element is visible
							$timeout(function(){
								// [0] dereferences the DOM object from the angular.element
								return scope.displayElements.text[0].focus();
							}, 100);
						}
					};
					
					// changes to the model variable from outside the html/text inputs
					// if no ngModel, then the only input is from inside text-angular
					if(attrs.ngModel){
						ngModel.$render = function(){
							scope.displayElements.forminput.val(ngModel.$viewValue);
							// if the editors aren't focused they need to be updated, otherwise they are doing the updating
							if(document.activeElement !== scope.displayElements.html[0] && document.activeElement !== scope.displayElements.text[0]){
								// catch model being null or undefined
								scope.html = ngModel.$viewValue || '';
							}
						};
						if(ngModel.$viewValue === undefined && originalContents !== undefined){
							// on passing through to taBind it will be sanitised
							ngModel.$setViewValue(originalContents);
						}
					}else{
						// if no ngModel then update from the contents of the origional html.
						scope.displayElements.forminput.val(_originalContents);
						scope.html = _originalContents;
					}
					
					scope.$watch('html', function(newValue, oldValue){
						if(newValue !== oldValue){
							if(attrs.ngModel) ngModel.$setViewValue(newValue);
							scope.displayElements.forminput.val(newValue);
						}
					});
					
					if(attrs.taTargetToolbars) _toolbars = textAngularManager.registerEditor(_name, scope, attrs.taTargetToolbars.split(','));
					else{
						var _toolbar = angular.element('<div text-angular-toolbar name="textAngularToolbar' + _serial + '">');
						// passthrough init of toolbar options
						if(attrs.taToolbar)						_toolbar.attr('ta-toolbar', attrs.taToolbar);
						if(attrs.taToolbarClass)				_toolbar.attr('ta-toolbar-class', attrs.taToolbarClass);
						if(attrs.taToolbarGroupClass)			_toolbar.attr('ta-toolbar-group-class', attrs.taToolbarGroupClass);
						if(attrs.taToolbarButtonClass)			_toolbar.attr('ta-toolbar-button-class', attrs.taToolbarButtonClass);
						if(attrs.taToolbarActiveButtonClass)	_toolbar.attr('ta-toolbar-active-button-class', attrs.taToolbarActiveButtonClass);
						
						element.prepend(_toolbar);
						$compile(_toolbar)(scope.$parent);
						_toolbars = textAngularManager.registerEditor(_name, scope, ['textAngularToolbar' + _serial]);
					}
					
					// the following is for applying the active states to the tools that support it
					scope._bUpdateSelectedStyles = false;
					// loop through all the tools polling their activeState function if it exists
					scope.updateSelectedStyles = function(){
						var _ranges;
						if(window.rangy && window.rangy.getSelection && (_ranges = window.rangy.getSelection().getAllRanges()).length === 1){
							_toolbars.updateSelectedStyles(angular.element(_ranges[0].commonAncestorContainer.parentNode));
						}else _toolbars.updateSelectedStyles();
						// used to update the active state when a key is held down, ie the left arrow
						if(scope._bUpdateSelectedStyles) $timeout(scope.updateSelectedStyles, 200);
					};
					// start updating on keydown
					_keydown = function(){
						scope._bUpdateSelectedStyles = true;
						scope.$apply(function(){
							scope.updateSelectedStyles();
						});
					};
					scope.displayElements.html.on('keydown', _keydown);
					scope.displayElements.text.on('keydown', _keydown);
					// stop updating on key up and update the display/model
					_keyup = function(){
						scope._bUpdateSelectedStyles = false;
					};
					scope.displayElements.html.on('keyup', _keyup);
					scope.displayElements.text.on('keyup', _keyup);
					// update the toolbar active states when we click somewhere in the text/html boxed
					_mouseup = function(){
						// ensure only one execution of updateSelectedStyles()
						scope._bUpdateSelectedStyles = false;
						scope.$apply(function(){
							scope.updateSelectedStyles();
						});
					};
					scope.displayElements.html.on('mouseup', _mouseup);
					scope.displayElements.text.on('mouseup', _mouseup);
				}
			};
		}
	]).directive('taBind', ['taSanitize', function(taSanitize){
		// Uses for this are textarea or input with ng-model and ta-bind='text'
		// OR any non-form element with contenteditable="contenteditable" ta-bind="html|text" ng-model
		return {
			require: 'ngModel',
			scope: {},
			link: function(scope, element, attrs, ngModel){
				// the option to use taBind on an input or textarea is required as it will sanitize all input into it correctly.
				var _isContentEditable = element.attr('contenteditable') !== undefined && element.attr('contenteditable');
				var _isInputFriendly = _isContentEditable || element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input';
				var _isReadonly = false;
				// in here we are undoing the converts used elsewhere to prevent the < > and & being displayed when they shouldn't in the code.
				var _compileHtml = function(){
					if(_isContentEditable) return element.html();
					if(_isInputFriendly) return element.val();
					throw ('textAngular Error: attempting to compile non-editable taBind');
				};
				
				//used for updating when inserting wrapped elements
				scope.$parent['updateTaBind' + (attrs.id || '')] = function(){
					if(_isInputFriendly && !_isReadonly) ngModel.$setViewValue(_compileHtml());
				};
				
				//this code is used to update the models when data is entered/deleted
				if(_isInputFriendly){
					element.on('keyup paste cut', function(){
						if(!_isReadonly) ngModel.$setViewValue(_compileHtml());
					});
				}
				
				if(_isInputFriendly && !_isContentEditable){
					element.on('change blur', function(){
						if(!_isReadonly) ngModel.$setViewValue(_compileHtml());
					});
				}
				
				// catch DOM XSS via taSanitize
				// Sanitizing both ways is identical
				var _sanitize = function(unsafe){
					return (ngModel.$oldViewValue = taSanitize(unsafe, ngModel.$oldViewValue));
				};
				
				// parsers trigger from the above keyup function or any other time that the viewValue is updated and parses it for storage in the ngModel
				ngModel.$parsers.push(_sanitize);
				// because textAngular is bi-directional (which is awesome) we need to also sanitize values going in from the server
				ngModel.$formatters.push(_sanitize);
				
				// changes to the model variable from outside the html/text inputs
				ngModel.$render = function(){
					// if the editor isn't focused it needs to be updated, otherwise it's receiving user input
					if(document.activeElement !== element[0]){
						// catch model being null or undefined
						var val = ngModel.$viewValue || '';
						if(_isContentEditable){
							// WYSIWYG Mode
							element.html(val);
							// if in WYSIWYG and readOnly we kill the use of links by clicking
							if(!_isReadonly) element.find('a').on('click', function(e){
								e.preventDefault();
								return false;
							});
						}else if(element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input'){
							// make sure the end user can SEE the html code as a display.
							element.html(val);
						}else{
							// only for input and textarea inputs
							element.val(val);
						}
					}
				};
				
				if(attrs.taReadonly){
					//set initial value
					if(scope.$parent.$eval(attrs.taReadonly)){
						// we changed to readOnly mode (taReadonly='true')
						if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
							element.attr('disabled', 'disabled');
						}
						if(element.attr('contenteditable') !== undefined && element.attr('contenteditable')){
							element.removeAttr('contenteditable');
						}
					}else{
						// we changed to NOT readOnly mode (taReadonly='false')
						if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
							element.removeAttr('disabled');
						}else if(_isContentEditable){
							element.attr('contenteditable', 'true');
						}
					}
					// taReadonly only has an effect if the taBind element is an input or textarea or has contenteditable='true' on it.
					// Otherwise it is readonly by default
					scope.$parent.$watch(attrs.taReadonly, function(newVal, oldVal){
						if(oldVal === newVal) return;
						if(newVal){
							// we changed to readOnly mode (taReadonly='true')
							if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
								element.attr('disabled', 'disabled');
							}
							if(element.attr('contenteditable') !== undefined && element.attr('contenteditable')){
								element.removeAttr('contenteditable');
							}
						}else{
							// we changed to NOT readOnly mode (taReadonly='false')
							if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
								element.removeAttr('disabled');
							}else if(_isContentEditable){
								element.attr('contenteditable', 'true');
							}
						}
						_isReadonly = newVal;
					});
				}
			}
		};
	}]).factory('taSanitize', ['$sanitize', function taSanitizeFactory($sanitize){
		// recursive function that returns an array of angular.elements that have the passed attribute set on them
		function getByAttribute(element, attribute){
			var resultingElements = [];
			var childNodes = element.children();
			if(childNodes.length){
				angular.forEach(childNodes, function(child){
					resultingElements = resultingElements.concat(getByAttribute(angular.element(child), attribute));
				});
			}
			if(element.attr(attribute)) resultingElements.push(element);
			return resultingElements;
		}
		return function taSanitize(unsafe, oldsafe){
			// unsafe and oldsafe should be valid HTML strings
			// any exceptions (lets say, color for example) should be made here but with great care
			// setup unsafe element for modification
			var unsafeElement = angular.element('<div>' + unsafe + '</div>');
			// replace all align='...' tags with text-align attributes
			angular.forEach(getByAttribute(unsafeElement, 'align'), function(element){
				element.css('text-align', element.attr('align'));
				element.removeAttr('align');
			});
			
			// get the html string back
			unsafe = unsafeElement.html();
			var safe;
			try {
				safe = $sanitize(unsafe);
			} catch (e){
				safe = oldsafe || '';
			}
			return safe;
		};
	}]).directive('textAngularToolbar', [
		'$compile', '$q', 'textAngularManager', 'taOptions', 'taTools',
		function($compile, $q, textAngularManager, taOptions, taTools){
			return {
				scope: {
					name: '@' // a name IS required
				},
				restrict: "EA",
				link: function(scope, element, attrs){
					angular.extend(scope, taOptions);
					if(attrs.taToolbar)						scope.toolbar = scope.$eval(attrs.taToolbar);
					if(attrs.taToolbarClass)				scope.classes.toolbar = attrs.taToolbarClass;
					if(attrs.taToolbarGroupClass)			scope.classes.toolbarGroup = attrs.taToolbarGroupClass;
					if(attrs.taToolbarButtonClass)			scope.classes.toolbarButton = attrs.taToolbarButtonClass;
					if(attrs.taToolbarActiveButtonClass)	scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass;
					
					scope.disabled = true;
					scope.focussed = false;
					element.html('');
					element.addClass("ta-toolbar " + scope.classes.toolbar);
					
					scope.$watch('focussed', function(){
						if(scope.focussed) element.addClass(scope.classes.focussed);
						else element.removeClass(scope.classes.focussed);
					});
					
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
	]).service('textAngularManager', [function(){
		// this service is used to manage all textAngular editors and toolbars.
		// All publicly published functions that modify/need to access the toolbar or editor scopes should be in here
		// these contain references to all the editors and toolbars that have been initialised in this app
		var toolbars = {}, editors = {};
		// when we focus into a toolbar, we need to set the TOOLBAR's $parent to be the toolbars it's linked to.
		// We also need to set the tools to be updated to be the toolbars...
		return {
			// register an editor and the toolbars that it is affected by
			registerEditor: function(name, scope, targetToolbars){
				// targetToolbars are optional, we don't require a toolbar to function
				if(!name || name === '') throw('textAngular Error: An editor requires a name');
				if(!scope) throw('textAngular Error: An editor requires a scope');
				if(editors[name]) throw ('textAngular Error: An Editor with name "' + name + '" already exists');
				var _toolbars = [];
				angular.forEach(targetToolbars, function(_name){
					if(!_toolbars[_name]) _toolbars.push(toolbars[_name]);
					// if it doesn't exist it may not have been compiled yet and it will be added later
				});
				editors[name] = {
					scope: scope,
					toolbars: targetToolbars,
					_registerToolbar: function(toolbarScope){
						// add to the list late
						if(this.toolbars.indexOf(toolbarScope.name) >= 0) _toolbars.push(toolbarScope);
					}
				};
				// this is a suite of functions the editor should use to update all it's linked toolbars
				return {
					disable: function(){
						// disable all linked toolbars
						angular.forEach(_toolbars, function(toolbarScope){ toolbarScope.disabled = true; });
					},
					enable: function(){
						// enable all linked toolbars
						angular.forEach(_toolbars, function(toolbarScope){ toolbarScope.disabled = false; });
					},
					focus: function(){
						// this should be called when the editor is focussed
						angular.forEach(_toolbars, function(toolbarScope){
							toolbarScope._parent = scope;
							toolbarScope.disabled = false;
							toolbarScope.focussed = true;
						});
					},
					unfocus: function(){
						// this should be called when the editor becomes unfocussed
						angular.forEach(_toolbars, function(toolbarScope){
							toolbarScope.disabled = true;
							toolbarScope.focussed = false;
						});
					},
					updateSelectedStyles: function(rangyRange){
						// rangyRange will only be populated if the rangy library is included
						// update the active state of all buttons on liked toolbars
						angular.forEach(_toolbars, function(toolbarScope){
							angular.forEach(toolbarScope.tools, function(toolScope){
								if(toolScope.activeState){
									toolScope.active = toolScope.activeState(rangyRange);
								}
							});
						});
					}
				};
			},
			// registers a toolbar such that it can be linked to editors
			registerToolbar: function(scope){
				if(!scope) throw('textAngular Error: A toolbar requires a scope');
				if(!scope.name || scope.name === '') throw('textAngular Error: A toolbar requires a name');
				if(toolbars[scope.name]) throw ('textAngular Error: A toolbar with name "' + scope.name + '" already exists');
				toolbars[scope.name] = scope;
				angular.forEach(editors, function(_editor){
					_editor._registerToolbar(scope);
				});
			},
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
		};
	}]);
})();