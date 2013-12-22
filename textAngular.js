/*
textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.1.2

See README.md or https://github.com/fraywing/textAngular/wiki for requirements and use.
*/

(function(window, angular, undefined) { 'use strict'; angular

.module("textAngular", ['ngSanitize']) //This makes ngSanitize required

.directive("textAngular", ['$compile', '$window', '$document', '$rootScope', '$timeout', '$log', 'taFixChrome', function($compile, $window, $document, $rootScope, $timeout, $log, taFixChrome) {
	$log.log("Thank you for using textAngular! http://www.textangular.com");
	// deepExtend instead of angular.extend in order to allow easy customization of "display" for default buttons
	// snatched from: http://stackoverflow.com/a/15311794/2966847
	function deepExtend(destination, source) {
		for (var property in source) {
			if (source[property] && source[property].constructor &&
				source[property].constructor === Object) {
				destination[property] = destination[property] || {};
				arguments.callee(destination[property], source[property]);
			} else {
				destination[property] = source[property];
			}
		}
		return destination;
	};
	// Here we set up the global display defaults, make sure we don't overwrite any that the user may have already set.
	$rootScope.textAngularOpts = deepExtend({
		toolbar: [
			['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
			['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo', 'clear'],
			['justifyLeft', 'justifyCenter', 'justifyRight'],
			['html', 'insertImage', 'insertLink', 'unlink']
		],
		classes: {
			focussed: "focussed",
			toolbar: "btn-toolbar",
			toolbarGroup: "btn-group",
			toolbarButton: "btn btn-default",
			toolbarButtonActive: "active",
			textEditor: 'form-control',
			htmlEditor: 'form-control'
		}
	}, ($rootScope.textAngularOpts != null)? $rootScope.textAngularOpts : {});
	// Setup the default toolbar tools, this way allows the user to add new tools like plugins
	var queryFormatBlockState = function(command){
		command = command.toLowerCase();
		var val = $document[0].queryCommandValue('formatBlock').toLowerCase();
		return val === command || val === command;
	};
	var buildDisplay = function(name) {
		// Provided name can be either the actual label or a Font Awesome class name 
		var label = (name.substring(0, 2) === "fa" ? "<i class='fa " + name + "'></i>" : name);
		return "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'>" + label + "</button>";
	};
	var buildAction = function(command, opt, promptText, promptDefaultText) {
		return function() {
			// If a prompt is needed show the popup, otherwise use provided opt
			var optLink = (promptText && prompt(promptText, promptDefaultText) || opt);
			if (optLink !== '' || optLink === opt) {
				return this.$parent.wrapSelection(command, optLink);
			}
		};
	};
	var buildActiveState = function(command, formatBlock) {
		return function() {
			return (formatBlock
				? queryFormatBlockState(command)
				: $document[0].queryCommandState(command)
			);
		};
	};
	var buildTool = function(display, action, activeState) {
		return {
			display: display,
			action: action,
			activeState: activeState
		};
	};
	var buildBlockTool = function(name, command, opt, state) {
		return buildTool(
			buildDisplay(name),
			buildAction(command, opt),
			buildActiveState(state, true)
		);
	};
	var buildInlineTool = function(name, command, state) {
		return buildTool(
			buildDisplay(name),
			buildAction(command, null),
			buildActiveState(state)
		);
	};
	var buildStatelessTool = function(name, command, promptText, promptDefaultText) {
		return buildTool(
			buildDisplay(name),
			buildAction(command, null, promptText, promptDefaultText)
		);
	};
	var buildHtmlTool = function(name) {
		return buildTool(
			buildDisplay(name),
			function() {
				var _parent = this.$parent;
				_parent.showHtml = !_parent.showHtml;
				//Show the HTML view or the WYSIWYG view
				var el = (_parent.showHtml ? _parent.displayElements.html[0] : _parent.displayElements.text[0]);
				$timeout(function() { //defer until the element is visible
					return el.focus(); //dereference the DOM object from the angular.element
				}, 100);
				this.active = _parent.showHtml;
			}
		);
	};
	$rootScope.textAngularTools = deepExtend({
		html: buildHtmlTool("Toggle HTML"),
		h1: buildBlockTool("H1", "formatBlock", "<H1>", "h1"),
		h2: buildBlockTool("H2", "formatBlock", "<H2>", "h2"),
		h3: buildBlockTool("H3", "formatBlock", "<H3>", "h3"),
		h4: buildBlockTool("H4", "formatBlock", "<H4>", "h4"),
		h5: buildBlockTool("H5", "formatBlock", "<H5>", "h5"),
		h6: buildBlockTool("H6", "formatBlock", "<H6>", "h6"),
		p: buildBlockTool("P", "formatBlock", "<P>", "p"),
		pre: buildBlockTool("pre", "formatBlock", "<PRE>", "pre"),
		quote: buildBlockTool("fa-quote-right", "formatBlock", "<BLOCKQUOTE>", "blockquote"),
		ul: buildInlineTool("fa-list-ul", "insertUnorderedList", "insertUnorderedList"),
		ol: buildInlineTool("fa-list-ol", "insertOrderedList", "insertOrderedList"),
		bold: buildInlineTool("fa-bold", "bold", null, "bold"),
		justifyLeft: buildInlineTool("fa-align-left", "justifyLeft", "justifyLeft"),
		justifyRight: buildInlineTool("fa-align-right", "justifyRight", "justifyRight"),
		justifyCenter: buildInlineTool("fa-align-center", "justifyCenter", "justifyCenter"),
		italics: buildInlineTool("fa-italic", "italic", "italic"),
		underline: buildInlineTool("fa-underline", "underline", "underline"),
		undo: buildStatelessTool("fa-undo", "undo"),
		redo: buildStatelessTool("fa-repeat", "redo"),
		clear: buildStatelessTool("fa-ban", "removeFormat"),
		unlink: buildStatelessTool("fa-unlink", "unlink"),
		insertImage: buildStatelessTool("fa-picture-o", "insertImage", "Please enter an image URL to insert", "http://"),
		insertLink: buildStatelessTool("fa-link", "createLink", "Please enter an URL to insert", "http://")
	}, ($rootScope.textAngularTools != null)? $rootScope.textAngularTools : {});
		
	return {
		require: '?ngModel',
		scope: {},
		restrict: "EA",
		link: function(scope, element, attrs, ngModel) {
			var group, groupElement, keydown, keyup, mouseup, tool, toolElement; //all these vars should not be accessable outside this directive
			// get the settings from the defaults and add our specific functions that need to be on the scope
			angular.extend(scope, $rootScope.textAngularOpts, {
				// wraps the selection in the provided tag / execCommand function.
				wrapSelection: function(command, opt) {
					document.execCommand(command, false, opt);
					// strip out the chrome specific rubbish that gets put in when using lists
					if(command === 'insertUnorderedList' || command === 'insertOrderedList') taFixChrome(scope.displayElements.text);
					// refocus on the shown display element, this fixes a display bug when using :focus styles to outline the box. You still have focus on the text/html input it just doesn't show up
					if (scope.showHtml)
						scope.displayElements.html[0].focus();
					else
						scope.displayElements.text[0].focus();
					// note that wrapSelection is called via ng-click in the tool plugins so we are already within a $apply
					scope.updateSelectedStyles();
					if (!scope.showHtml) scope.updateTaBindtext(); // only update if NOT in html mode
				},
				showHtml: false
			});
			// setup the options from the optional attributes
			if (!!attrs.taToolbar)					scope.toolbar = scope.$eval(attrs.taToolbar);
			if (!!attrs.taFocussedClass)			scope.classes.focussed = scope.$eval(attrs.taFocussedClass);
			if (!!attrs.taToolbarClass)				scope.classes.toolbar = attrs.taToolbarClass;
			if (!!attrs.taToolbarGroupClass)		scope.classes.toolbarGroup = attrs.taToolbarGroupClass;
			if (!!attrs.taToolbarButtonClass)		scope.classes.toolbarButton = attrs.taToolbarButtonClass;
			if (!!attrs.taToolbarActiveButtonClass)	scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass;
			if (!!attrs.taTextEditorClass)			scope.classes.textEditor = attrs.taTextEditorClass;
			if (!!attrs.taHtmlEditorClass)			scope.classes.htmlEditor = attrs.taHtmlEditorClass;
			
			var originalContents = element.html();
			element.html(''); // clear the original content
			
			// Setup the HTML elements as variable references for use later
			scope.displayElements = {
				toolbar: angular.element("<div></div>"),
				forminput: angular.element("<input type='hidden' style='display: none;'>"), // we still need the hidden input even with a textarea as the textarea may have invalid/old input in it, wheras the input will ALLWAYS have the correct value.
				html: angular.element("<textarea ng-show='showHtml' ta-bind='html' ng-model='html' ></textarea>"),
				text: angular.element("<div contentEditable='true' ng-hide='showHtml' ta-bind='text' ng-model='text' ></div>")
			};
			// add the main elements to the origional element
			element.append(scope.displayElements.toolbar);
			element.append(scope.displayElements.text);
			element.append(scope.displayElements.html);
			
			if(!!attrs.name){
				scope.displayElements.forminput.attr('name', attrs.name);
				element.append(scope.displayElements.forminput);
			}
			
			if(!!attrs.taDisabled){
				scope.displayElements.text.attr('ta-readonly', 'disabled');
				scope.displayElements.html.attr('ta-readonly', 'disabled');
				scope.disabled = scope.$parent.$eval(attrs.taDisabled);
				scope.$parent.$watch(attrs.taDisabled, function(newVal){
					scope.disabled = newVal;
					if(scope.disabled){
						element.addClass('disabled');
					}else{
						element.removeClass('disabled');
					}
				});
			}
			
			// compile the scope with the text and html elements only - if we do this with the main element it causes a compile loop
			$compile(scope.displayElements.text)(scope);
			$compile(scope.displayElements.html)(scope);
			
			// add the classes manually last
			element.addClass("ta-root");
			scope.displayElements.toolbar.addClass("ta-toolbar " + scope.classes.toolbar);
			scope.displayElements.text.addClass("ta-text ta-editor " + scope.classes.textEditor);
			scope.displayElements.html.addClass("ta-html ta-editor " + scope.classes.textEditor);
			
			// note that focusout > focusin is called everytime we click a button
			element.on('focusin', function(){ // cascades to displayElements.text and displayElements.html automatically.
				element.addClass(scope.classes.focussed);
				$timeout(function(){ element.triggerHandler('focus'); }, 0); // to prevent multiple apply error defer to next seems to work.
			});
			element.on('focusout', function(){
				$timeout(function(){
					// if we have NOT focussed again on the text etc then fire the blur events
					if(!($document[0].activeElement === scope.displayElements.html[0]) && !($document[0].activeElement === scope.displayElements.text[0])){
						element.removeClass(scope.classes.focussed);
						$timeout(function(){ element.triggerHandler('blur'); }, 0); // to prevent multiple apply error defer to next seems to work.
					}
				}, 0);
			});
			
			scope.tools = {}; // Keep a reference for updating the active states later
			// create the tools in the toolbar
			for (var _i = 0; _i < scope.toolbar.length; _i++) {
				// setup the toolbar group
				group = scope.toolbar[_i];
				groupElement = angular.element("<div></div>");
				groupElement.addClass(scope.classes.toolbarGroup);
				for (var _j = 0; _j < group.length; _j++) {
					// init and add the tools to the group
					tool = group[_j]; // a tool name (key name from textAngularTools struct)
					toolElement = angular.element($rootScope.textAngularTools[tool].display);
					toolElement.addClass(scope.classes.toolbarButton);
					toolElement.attr('unselectable', 'on'); // important to not take focus from the main text/html entry
					toolElement.attr('ng-disabled', 'showHtml()');
					var childScope = angular.extend(scope.$new(true), $rootScope.textAngularTools[tool], { // add the tool specific functions
						name: tool,
						showHtml: function(){
							if(this.name !== 'html') return this.$parent.disabled || this.$parent.showHtml;
							return this.$parent.disabled;
						},
						displayActiveToolClass: function(active){
							return (active)? this.$parent.classes.toolbarButtonActive : '';
						}
					}); //creates a child scope of the main angularText scope and then extends the childScope with the functions of this particular tool
					scope.tools[tool] = childScope; // reference to the scope kept
					groupElement.append($compile(toolElement)(childScope)); // append the tool compiled with the childScope to the group element
				}
				scope.displayElements.toolbar.append(groupElement); // append the group to the toolbar
			}
			
			// changes to the model variable from outside the html/text inputs
			if(attrs.ngModel){ // if no ngModel, then the only input is from inside text-angular
				ngModel.$render = function() {
					scope.displayElements.forminput.val(ngModel.$viewValue);
					if(ngModel.$viewValue === undefined) return;
					// if the editors aren't focused they need to be updated, otherwise they are doing the updating
					if (!($document[0].activeElement === scope.displayElements.html[0]) && !($document[0].activeElement === scope.displayElements.text[0])) {
						var val = ngModel.$viewValue || ''; // in case model is null
						scope.text = val;
						scope.html = val;
					}
				};
			}else{ // if no ngModel then update from the contents of the origional html.
				scope.displayElements.forminput.val(originalContents);
				scope.text = originalContents;
				scope.html = originalContents;
			}
			
			scope.$watch('text', function(newValue, oldValue){
				scope.html = newValue;
				if(attrs.ngModel) ngModel.$setViewValue(newValue);
				scope.displayElements.forminput.val(newValue);
			});
			scope.$watch('html', function(newValue, oldValue){
				scope.text = newValue;
				if(attrs.ngModel) ngModel.$setViewValue(newValue);
				scope.displayElements.forminput.val(newValue);
			});
			
			// the following is for applying the active states to the tools that support it
			scope.bUpdateSelectedStyles = false;
			// loop through all the tools polling their activeState function if it exists
			scope.updateSelectedStyles = function() {
				for (var _k = 0; _k < scope.toolbar.length; _k++) {
					var groups = scope.toolbar[_k];
					for (var _l = 0; _l < groups.length; _l++) {
						tool = groups[_l];
						if (scope.tools[tool].activeState != null) {
							scope.tools[tool].active = scope.tools[tool].activeState.apply(scope);
						}
					}
				}
				if (scope.bUpdateSelectedStyles) $timeout(scope.updateSelectedStyles, 200); // used to update the active state when a key is held down, ie the left arrow
			};
			// start updating on keydown
			keydown = function(e) {
				scope.bUpdateSelectedStyles = true;
				scope.$apply(function() {
					scope.updateSelectedStyles();
				});
			};
			scope.displayElements.html.on('keydown', keydown);
			scope.displayElements.text.on('keydown', keydown);
			// stop updating on key up and update the display/model
			keyup = function(e) {
				scope.bUpdateSelectedStyles = false;
			};
			scope.displayElements.html.on('keyup', keyup);
			scope.displayElements.text.on('keyup', keyup);
			// update the toolbar active states when we click somewhere in the text/html boxed
			mouseup = function(e) {
				scope.$apply(function() {
					scope.updateSelectedStyles();
				});
			};
			scope.displayElements.html.on('mouseup', mouseup);
			scope.displayElements.text.on('mouseup', mouseup);
		}
	};
}])

.directive('taBind', ['$sanitize', '$document', 'taFixChrome', function($sanitize, $document, taFixChrome){
	// Uses for this are textarea or input with ng-model and ta-bind='text' OR any non-form element with contenteditable="contenteditable" ta-bind="html|text" ng-model
	return {
		require: 'ngModel',
		scope: {'taBind': '@'},
		link: function(scope, element, attrs, ngModel){
			var isContentEditable = element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input' && element.attr('contenteditable') !== undefined && element.attr('contenteditable');
			var isReadonly = false;
			// in here we are undoing the converts used elsewhere to prevent the < > and & being displayed when they shouldn't in the code.
			var compileHtml = function(){
				var result = taFixChrome(angular.element("<div>").append(element.html())).html();
				if(scope.taBind === 'html' && isContentEditable) result = result.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, '&');
				return result;
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
				element.on('keyup', function(e){
					if(!isReadonly) ngModel.$setViewValue(compileHtml());
				});
			}
			
			ngModel.$parsers.push(function(value){
				// all the code here takes the information from the above keyup function or any other time that the viewValue is updated and parses it for storage in the ngModel
				if(ngModel.$oldViewValue === undefined) ngModel.$oldViewValue = value;
				try{
					$sanitize(value); // this is what runs when ng-bind-html is used on the variable
				}catch(e){
					return ngModel.$oldViewValue; //prevents the errors occuring when we are typing in html code
				}
				ngModel.$oldViewValue = value;
				return value;
			});
			
			// changes to the model variable from outside the html/text inputs
			ngModel.$render = function() {
				if(ngModel.$viewValue === undefined) return;
				// if the editor isn't focused it needs to be updated, otherwise it's receiving user input
				var val = ngModel.$viewValue || ''; // in case model is null
				if ($document[0].activeElement !== element[0]) {
					ngModel.$oldViewValue = val;
					if(scope.taBind === 'text'){ //WYSIWYG Mode
						element.html(val);
						element.find('a').on('click', function(e){
							e.preventDefault();
							return false;
						});
					}else if(isContentEditable || (element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input')) // make sure the end user can SEE the html code.
						element.html(val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, '&gt;'));
					else element.val(val); // only for input and textarea inputs
				}else if(!isContentEditable) element.val(val); // only for input and textarea inputs
			};
			
			if(!!attrs.taReadonly){
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
}])

.factory('taFixChrome', function(){
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
		$html.html(result);
		return $html;
	};
	return taFixChrome;
})

;}) (window, window.angular);