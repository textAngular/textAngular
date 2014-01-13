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
		toolbar: [['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'], ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'], ['justifyLeft','justifyCenter','justifyRight'],['html', 'insertImage', 'insertLink', 'unlink']],
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
			display: [string] an HTML element to be displayed as the buton. The `scope` of the button is the tool definition object with some additional functions
			action: [function(deferred)] a function that is executed on clicking on the button - this will allways be executed using ng-click and will overwrite any ng-click value in the display attribute.
					The function is passed a deferred object ($q.defer()), if this is wanted to be used `return false;` from the action and manually call `deferred.resolve();` elsewhere to notify the editor that the action has finished.
			buttontext: [string]? if this is defined it will replace the contents of the element contained in the `display` element
			iconclass: [string]? if this is defined an icon (<i>) will be appended to the `display` element with this string as it's class
			activestate: [function()]? this function is called on every caret movement, if it returns true then the class taOptions.classes.toolbarButtonActive will be applied to the `display` element, else the class will be removed
			disabled: [function()]? if this function returns true then the tool will have the class taOptions.classes.disabled applied to it, else it will be removed
		Other functions available on the scope are:
			displayActiveToolClass: [function(boolean)] 
			name: [string] the name of the tool, this is the first parameter passed into taRegisterTool
			isDisabled: [function()] returns true if the tool is disabled, false if it isn't
			displayActiveToolClass: [function()] returns true if the tool is 'active' in the currently focussed toolbar
	*/
	// name and toolDefinition to add into the tools available to be added on the toolbar
	function registerTextAngularTool(name, toolDefinition){
		if(!name || name === '') throw('textAngular Error: A name is required for a Tool Definition');
		if(!toolDefinition.display || toolDefinition.display === '' || angular.element(toolDefinition.display).length === 0) throw('textAngular Error: Tool Definition for "' + name + '" does not have a valid display value');
		taTools[name] = toolDefinition;
	}
	
	textAngular.constant('taRegisterTool', registerTextAngularTool);
	
	// The activeState function is invoked on the textAngular scope, not the tool scope. All the other functions are called on the tool scope, a child scope of the main textAngular scope.
	textAngular.value('taTools', taTools);
	
	// configure initial textAngular tools here via taRegisterTool
	textAngular.config(['taRegisterTool', function(taRegisterTool){
		taRegisterTool("html", {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			buttontext: 'Toggle HTML',
			action: function() {
				this.$editor().switchView();
			},
			activeState: function(){
				return this.$editor().showHtml;
			}
		});
		// add the Header tools
		var _retActiveStateFunction = function(q){ // convenience function so that the loop works correctly
			return function() { return this.$editor().queryFormatBlockState(q); };
		};
		var headerAction = function() {
			return this.$editor().wrapSelection("formatBlock", "<" + this.name.toUpperCase() +">");
		};
		for(var h = 1; h <= 6; h++){
			taRegisterTool('h' + h, {
				display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
				buttontext: 'H' + h,
				action: headerAction,
				activeState: _retActiveStateFunction('h' + h)
			});
		}
		taRegisterTool('p', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			buttontext: 'P',
			action: function() {
				return this.$editor().wrapSelection("formatBlock", "<P>");
			},
			activeState: function() { return this.$editor().queryFormatBlockState('p'); }
		});
		taRegisterTool('pre', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			buttontext: 'pre',
			action: function() {
				return this.$editor().wrapSelection("formatBlock", "<PRE>");
			},
			activeState: function() { return this.$editor().queryFormatBlockState('pre'); }
		});
		taRegisterTool('ul', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-list-ul',
			action: function() {
				return this.$editor().wrapSelection("insertUnorderedList", null);
			},
			activeState: function() { return document.queryCommandState('insertUnorderedList'); }
		});
		taRegisterTool('ol', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-list-ol',
			action: function() {
				return this.$editor().wrapSelection("insertOrderedList", null);
			},
			activeState: function() { return document.queryCommandState('insertOrderedList'); }
		});
		taRegisterTool('quote', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-quote-right',
			action: function() {
				return this.$editor().wrapSelection("formatBlock", "<BLOCKQUOTE>");
			},
			activeState: function() { return this.$editor().queryFormatBlockState('blockquote'); }
		});
		taRegisterTool('undo', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-undo',
			action: function() {
				return this.$editor().wrapSelection("undo", null);
			}
		});
		taRegisterTool('redo', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-repeat',
			action: function() {
				return this.$editor().wrapSelection("redo", null);
			}
		});
		taRegisterTool('bold', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-bold',
			action: function() {
				return this.$editor().wrapSelection("bold", null);
			},
			activeState: function() {
				return document.queryCommandState('bold');
			}
		});
		taRegisterTool('justifyLeft', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-align-left',
			action: function() {
				return this.$editor().wrapSelection("justifyLeft", null);
			},
			activeState: function() {
				return document.queryCommandState('justifyLeft');
			}
		});
		taRegisterTool('justifyRight', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-align-right',
			action: function() {
				return this.$editor().wrapSelection("justifyRight", null);
			},
			activeState: function() {
				return document.queryCommandState('justifyRight');
			}
		});
		taRegisterTool('justifyCenter', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-align-center',
			action: function() {
				return this.$editor().wrapSelection("justifyCenter", null);
			},
			activeState: function() {
				return document.queryCommandState('justifyCenter');
			}
		});
		taRegisterTool('italics', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-italic',
			action: function() {
				return this.$editor().wrapSelection("italic", null);
			},
			activeState: function() {
				return document.queryCommandState('italic');
			}
		});
		taRegisterTool('underline', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-underline',
			action: function() {
				return this.$editor().wrapSelection("underline", null);
			},
			activeState: function() {
				return document.queryCommandState('underline');
			}
		});
		taRegisterTool('clear', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-ban',
			action: function() {
				return this.$editor().wrapSelection("removeFormat", null);
			}
		});
		taRegisterTool('insertImage', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-picture-o',
			action: function() {
				var imageLink;
				imageLink = prompt("Please enter an image URL to insert", 'http://');
				if (imageLink !== '') {
					return this.$editor().wrapSelection('insertImage', imageLink);
				}
			}
		});
		taRegisterTool('insertLink', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-link',
			action: function() {
				var urlLink;
				urlLink = prompt("Please enter an URL to insert", 'http://');
				if (urlLink !== '') {
					return this.$editor().wrapSelection('createLink', urlLink);
				}
			}
		});
		taRegisterTool('unlink', {
			display: "<button type='button' ng-class='displayActiveToolClass(active)'>",
			iconclass: 'fa fa-unlink',
			action: function() {
				return this.$editor().wrapSelection('unlink', null);
			}
		});
	}]);
	
	textAngular.directive("textAngular", ['$compile', '$timeout', '$log', 'taOptions', 'taToolbarEditorLinker', function($compile, $timeout, $log, taOptions, taToolbarEditorLinker) {
		$log.info("Thank you for using textAngular! http://www.textangular.com");
		return {
			require: '?ngModel',
			scope: {},
			restrict: "EA",
			link: function(scope, element, attrs, ngModel) {
				var keydown, keyup, mouseup, originalContents; //all these vars should not be accessable outside this directive
				var _toolbars, _serial = Math.floor(Math.random() * 10000000000000000), _name = (attrs.name) ? attrs.name : 'textAngularEditor' + _serial;
				// get the settings from the defaults and add our specific functions that need to be on the scope
				angular.extend(scope, taOptions, {
					// wraps the selection in the provided tag / execCommand function.
					wrapSelection: function(command, opt) {
						document.execCommand(command, false, opt);
						// refocus on the shown display element, this fixes a display bug when using :focus styles to outline the box. You still have focus on the text/html input it just doesn't show up
						if (scope.showHtml)
							scope.displayElements.html[0].focus();
						else
							scope.displayElements.text[0].focus();
					},
					showHtml: false
				});
				// setup the options from the optional attributes
				if(attrs.taFocussedClass)			scope.classes.focussed = scope.$eval(attrs.taFocussedClass);
				if(attrs.taTextEditorClass)			scope.classes.textEditor = attrs.taTextEditorClass;
				if(attrs.taHtmlEditorClass)			scope.classes.htmlEditor = attrs.taHtmlEditorClass;
				
				originalContents = element.html();
				element.html(''); // clear the original content
				
				// Setup the HTML elements as variable references for use later
				scope.displayElements = {
					forminput: angular.element("<input type='hidden' tabindex='-1' style='display: none;'>"), // we still need the hidden input even with a textarea as the textarea may have invalid/old input in it, wheras the input will ALLWAYS have the correct value.
					html: angular.element("<textarea ng-show='showHtml' ta-bind='html' ng-model='html' ></textarea>"),
					text: angular.element("<div contentEditable='true' ng-hide='showHtml' ta-bind='text' ng-model='html' ></div>")
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
				scope.startAction = function(){
					scope._actionRunning = true;
				};
				scope.endAction = function(){
					scope._actionRunning = false;
					scope.updateSelectedStyles();
					if (!scope.showHtml) scope.updateTaBindtext(); // only update if in text or WYSIWYG mode
				};
				
				// note that focusout > focusin is called everytime we click a button
				element.on('focusin', function(){ // cascades to displayElements.text and displayElements.html automatically.
					element.addClass(scope.classes.focussed);
					_toolbars.focus();
					$timeout(function(){ element.triggerHandler('focus'); }, 0); // to prevent multiple apply error defer to next seems to work.
				});
				element.on('focusout', function(e){
					$timeout(function(){
						// if we have NOT focussed again on the text etc then fire the blur events
						if(document.activeElement !== scope.displayElements.html[0] && document.activeElement !== scope.displayElements.text[0]){
							element.removeClass(scope.classes.focussed);
							if(!scope._actionRunning) _toolbars.unfocus();
							$timeout(function(){ element.triggerHandler('blur'); }, 0); // to prevent multiple apply error defer to next seems to work.
						}
					}, 100);
					e.preventDefault();
					return false;
				});
				
				// Setup the default toolbar tools, this way allows the user to add new tools like plugins. This is on the editor for future proofing if we find a better way to do this.
				scope.queryFormatBlockState = function(command){
					command = command.toLowerCase();
					var val = document.queryCommandValue('formatBlock').toLowerCase();
					return val === command || val === command;
				};
				scope.switchView = function(){
					scope.showHtml = !scope.showHtml;
					if (scope.showHtml) { //Show the HTML view
						$timeout(function() { //defer until the element is visible
							return scope.displayElements.html[0].focus(); // [0] dereferences the DOM object from the angular.element
						}, 100);
					} else { //Show the WYSIWYG view
						$timeout(function() { //defer until the element is visible
							return scope.displayElements.text[0].focus(); // [0] dereferences the DOM object from the angular.element
						}, 100);
					}
				};
				
				// changes to the model variable from outside the html/text inputs
				if(attrs.ngModel){ // if no ngModel, then the only input is from inside text-angular
					ngModel.$render = function() {
						scope.displayElements.forminput.val(ngModel.$viewValue);
						// if the editors aren't focused they need to be updated, otherwise they are doing the updating
						if (document.activeElement !== scope.displayElements.html[0] && document.activeElement !== scope.displayElements.text[0]) {
							var val = ngModel.$viewValue || ''; // in case model is null
							scope.html = val;
						}
					};
				}else{ // if no ngModel then update from the contents of the origional html.
					scope.displayElements.forminput.val(originalContents);
					scope.html = originalContents;
				}
				
				scope.$watch('html', function(newValue, oldValue){
					if(newValue !== oldValue){
						if(attrs.ngModel) ngModel.$setViewValue(newValue);
						scope.displayElements.forminput.val(newValue);
					}
				});
				
				if(attrs.taTargetToolbars) _toolbars = taToolbarEditorLinker.registerEditor(name, scope, attrs.taTargetToolbars.split(','));
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
					_toolbars = taToolbarEditorLinker.registerEditor(_name, scope, ['textAngularToolbar' + _serial]);
				}
				
				// the following is for applying the active states to the tools that support it
				scope._bUpdateSelectedStyles = false;
				// loop through all the tools polling their activeState function if it exists
				scope.updateSelectedStyles = function() {
					_toolbars.updateSelectedStyles();
					if (scope._bUpdateSelectedStyles) $timeout(scope.updateSelectedStyles, 200); // used to update the active state when a key is held down, ie the left arrow
				};
				// start updating on keydown
				keydown = function() {
					scope._bUpdateSelectedStyles = true;
					scope.$apply(function() {
						scope.updateSelectedStyles();
					});
				};
				scope.displayElements.html.on('keydown', keydown);
				scope.displayElements.text.on('keydown', keydown);
				// stop updating on key up and update the display/model
				keyup = function() {
					scope._bUpdateSelectedStyles = false;
				};
				scope.displayElements.html.on('keyup', keyup);
				scope.displayElements.text.on('keyup', keyup);
				// update the toolbar active states when we click somewhere in the text/html boxed
				mouseup = function() {
					scope._bUpdateSelectedStyles = false; // ensure only one execution of updateSelectedStyles()
					scope.$apply(function() {
						scope.updateSelectedStyles();
					});
				};
				scope.displayElements.html.on('mouseup', mouseup);
				scope.displayElements.text.on('mouseup', mouseup);
			}
		};
	}]).directive('taBind', ['$sanitize', 'taFixChrome', function($sanitize, taFixChrome){
		// Uses for this are textarea or input with ng-model and ta-bind='text' OR any non-form element with contenteditable="contenteditable" ta-bind="html|text" ng-model
		return {
			require: 'ngModel',
			scope: {'taBind': '@'},
			link: function(scope, element, attrs, ngModel){
				var isContentEditable = element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input' && element.attr('contenteditable') !== undefined && element.attr('contenteditable');
				var isReadonly = false;
				// in here we are undoing the converts used elsewhere to prevent the < > and & being displayed when they shouldn't in the code.
				var compileHtml = function(){
					return taFixChrome(element).html();
				};
				
				scope.$parent['updateTaBind' + scope.taBind] = function(){//used for updating when inserting wrapped elements
					var compHtml = compileHtml();
					var tempParsers = ngModel.$parsers;
					ngModel.$parsers = []; // temp disable of the parsers
					ngModel.$oldViewValue = compHtml;
					ngModel.$setViewValue(compHtml);
					ngModel.$parsers = tempParsers;
				};
				
				//this code is used to update the models when data is entered/deleted
				if(isContentEditable){
					element.on('keyup', function(){
						if(!isReadonly) ngModel.$setViewValue(compileHtml());
					});
				}
				
				ngModel.$parsers.push(function(value){
					// all the code here takes the information from the above keyup function or any other time that the viewValue is updated and parses it for storage in the ngModel
					if(ngModel.$oldViewValue === undefined) ngModel.$oldViewValue = value;
					try{
						value = ngModel.$oldViewValue = $sanitize(value); // this is what runs when ng-bind-html is used on the variable
					}catch(e){
						return ngModel.$oldViewValue; //prevents the errors occuring when we are typing in html code
					}
					return value;
				});
				
				// changes to the model variable from outside the html/text inputs
				ngModel.$render = function() {
					// if the editor isn't focused it needs to be updated, otherwise it's receiving user input
					var val = ngModel.$viewValue || ''; // in case model is null
					if (document.activeElement !== element[0]) {
						ngModel.$oldViewValue = val;
						if(scope.taBind === 'text'){ //WYSIWYG Mode
							val = $sanitize(val); // make the output safe to avoid the insertion of DOM XSS
							element.html(val); // escape out of the div to get corrected val (val = e.html())
							element.find('a').on('click', function(e){
								e.preventDefault();
								return false;
							});
						}else if(isContentEditable || (element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input')) // make sure the end user can SEE the html code.
							element.html(val);
						else element.val(val); // only for input and textarea inputs
					}else if(!isContentEditable) element.val(val); // only for input and textarea inputs
				};
				
				if(attrs.taReadonly){
					//set initial value
					if(scope.$parent.$eval(attrs.taReadonly)){ // we changed to readOnly mode (taReadonly='true')
						if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') element.attr('disabled', 'disabled');
						if(element.attr('contenteditable') !== undefined && element.attr('contenteditable')) element.removeAttr('contenteditable');
					}else{ // we changed to NOT readOnly mode (taReadonly='false')
						if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') element.removeAttr('disabled');
						else if(isContentEditable) element.attr('contenteditable', 'true');
					}
					scope.$parent.$watch(attrs.taReadonly, function(newVal, oldVal){ // taReadonly only has an effect if the taBind element is an input or textarea or has contenteditable='true' on it. Otherwise it is readonly by default
						if(oldVal === newVal) return;
						if(newVal){ // we changed to readOnly mode (taReadonly='true')
							if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') element.attr('disabled', 'disabled');
							if(element.attr('contenteditable') !== undefined && element.attr('contenteditable')) element.removeAttr('contenteditable');
						}else{ // we changed to NOT readOnly mode (taReadonly='false')
							if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input') element.removeAttr('disabled');
							else if(isContentEditable) element.attr('contenteditable', 'true');
						}
						isReadonly = newVal;
					});
				}
			}
		};
	}]).factory('taFixChrome', function(){
		// get whaterever rubbish is inserted in chrome
		var taFixChrome = function($html){ // should be an angular.element object, returns object for chaining convenience
			// fix the chrome trash that gets inserted sometimes
			var spans = angular.element($html).find('span'); // default wrapper is a span so find all of them
			for(var s = 0; s < spans.length; s++){
				var span = angular.element(spans[s]);
				if(span.attr('style') && span.attr('style').match(/line-height: 1.428571429;|color: inherit; line-height: 1.1;/i)){ // chrome specific string that gets inserted into the style attribute, other parts may vary. Second part is specific ONLY to hitting backspace in Headers
					if(span.next().length > 0 && span.next()[0].tagName === 'BR') span.next().remove();
					span.replaceWith(span.html());
				}
			}
			var result = $html.html().replace(/style="[^"]*?(line-height: 1.428571429;|color: inherit; line-height: 1.1;)[^"]*"/ig, ''); // regex to replace ONLY offending styles - these can be inserted into various other tags on delete
			if(result !== $html.html()) $html.html(result); // only replace when something has changed, else we get focus problems on inserting lists
			return $html;
		};
		return taFixChrome;
	}).directive('textAngularToolbar', ['$compile', '$q', 'taToolbarEditorLinker', 'taOptions', 'taTools', function($compile, $q, taToolbarEditorLinker, taOptions, taTools){
		return {
			scope: {
				name: '@' // a name IS required
			},
			restrict: "EA",
			link: function(scope, element, attrs) {
				angular.extend(scope, taOptions);
				if(attrs.taToolbar)						scope.toolbar = scope.$eval(attrs.taToolbar);
				if(attrs.taToolbarClass)				scope.classes.toolbar = attrs.taToolbarClass;
				if(attrs.taToolbarGroupClass)			scope.classes.toolbarGroup = attrs.taToolbarGroupClass;
				if(attrs.taToolbarButtonClass)			scope.classes.toolbarButton = attrs.taToolbarButtonClass;
				if(attrs.taToolbarActiveButtonClass)	scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass;
				
				scope.disabled = true;
				element.html('');
				element.addClass("ta-toolbar " + scope.classes.toolbar);
				
				setupToolElement = function(toolElement, toolDefinition, toolScope){
					toolElement.addClass(scope.classes.toolbarButton);
					toolElement.attr('name', toolScope.name);
					toolElement.attr('unselectable', 'on'); // important to not take focus from the main text/html entry
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
				
				scope.tools = {}; // Keep a reference for updating the active states later
				// create the tools in the toolbar
				// default functions and values that don't change in each tool init
				scope._parent = { // default value is toolbar in disabled state, these values prevent errors
					disabled: true,
					showHtml: false
				};
				var defaultChildScope = {
					$editor: function(){ return scope._parent; }, // dynamically gets the editor as it is set
					isDisabled: function(){ // to set your own disabled logic set a function or boolean on the tool called 'disabled'
						return ( // this bracket is important as without it it just returns the first bracket and ignores the rest
							this.$eval('disabled') || this.$eval('disabled()') || // when the button's disabled function/value evaluates to true
							(this.name !== 'html' && this.$editor().showHtml) || // all buttons except the HTML Switch button should be disabled in the showHtml (RAW html) mode
							this.$parent.disabled || // if the toolbar is disabled
							this.$editor().disabled // if the current editor is disabled
						);
					},
					displayActiveToolClass: function(active){
						return (active)? this.$editor().classes.toolbarButtonActive : '';
					},
					executeAction: function(){
						var deferred = $q.defer(),
							promise = deferred.promise;
						promise['finally'](this.$editor().endAction);
						this.$editor().startAction();
						var result = this.action(deferred);
						if(result || result === undefined){ // if true or undefined is returned then the action has finished. Otherwise the deferred action will be resolved manually.
							deferred.resolve();
						}
					}
				};
						
				for (var _i = 0; _i < scope.toolbar.length; _i++) {
					// setup the toolbar group
					group = scope.toolbar[_i];
					groupElement = angular.element("<div>");
					groupElement.addClass(scope.classes.toolbarGroup);
					for (var _j = 0; _j < group.length; _j++) {
						// init and add the tools to the group
						tool = group[_j]; // a tool name (key name from taTools struct)
						toolElement = angular.element(taTools[tool].display);
						var childScope = angular.extend(scope.$new(true), taTools[tool], defaultChildScope, {name: tool}); //creates a child scope of the main angularText scope and then extends the childScope with the functions of this particular tool
						scope.tools[tool] = childScope; // reference to the scope kept
						groupElement.append(setupToolElement(toolElement, taTools[tool], childScope)); // append the tool compiled with the childScope to the group element
						scope.tools[tool].$element = toolElement;
					}
					element.append(groupElement); // append the group to the toolbar
				}
				
				// update a tool
				scope.updateTool = function(key, _newTool){
					var oldTool = taTools[key], toolInstance = scope.tools[key];
					if(toolInstance){ // if tool is defined on this toolbar, update/redo the tool
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
						}else{
							toolElement = toolInstance.$element;
						}
						
						toolElement = setupToolElement(toolElement, _newTool, toolInstance);
						toolInstance.$element.replaceWith(toolElement);
						toolInstance.$element = toolElement;
					}
				};
				
				taToolbarEditorLinker.registerToolbar(scope);
			}
		};
	}]).service('taToolbarEditorLinker', [function(){
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
			},
			registerToolbar: function(scope){
				if(toolbars[scope.name]) throw ('textAngular Error: a Toolbar with name "' + scope.name + '" already exists');
				toolbars[scope.name] = scope;
				angular.forEach(editors, function(_editor){
					_editor._registerToolbar(scope);
				});
			},
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
})();