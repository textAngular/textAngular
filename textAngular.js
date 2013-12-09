/*
textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.1.2

See README.md or http://github.com/fraywing/textangular for requirements and use.
*/


var textAngular = angular.module("textAngular", ['ngSanitize']); //This makes ngSanitize required

textAngular.directive("textAngular", function($compile, $sce, $window, $document, $rootScope, $timeout, taFixChrome) {
	console.log("Thank you for using textAngular! http://www.textangular.com")
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
		toolbar: [['h1', 'h2', 'h3', 'p', 'pre', 'bold', 'italics', 'ul', 'ol', 'redo', 'undo', 'clear'], ['html', 'insertImage', 'insertLink']],
		classes: {
			toolbar: "btn-toolbar",
			toolbarGroup: "btn-group",
			toolbarButton: "btn btn-default",
			toolbarButtonActive: "active",
			textEditor: 'form-control',
			htmlEditor: 'form-control'
		}
	}, ($rootScope.textAngularOpts != null)? $rootScope.textAngularOpts : {});
	// Setup the default toolbar tools, this way allows the user to add new tools like plugins
	$rootScope.textAngularTools = deepExtend({
		html: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'>Toggle HTML</button>",
			action: function() {
				// this variable in an action function referrs to the angular scope of the tool
				var ht, _this = this;
				this.$parent.showHtml = !this.$parent.showHtml;
				if (this.$parent.showHtml) { //Show the HTML view
					$timeout((function() { //defer until the element is visible
						return _this.$parent.displayElements.html[0].focus(); //dereference the DOM object from the angular.element
					}), 100);
				} else { //Show the WYSIWYG view
					$timeout((function() { //defer until the element is visible
						return _this.$parent.displayElements.text[0].focus(); //dereference the DOM object from the angular.element
					}), 100);
				}
				this.active = this.$parent.showHtml;
			}
		},
		h1: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'>H1</button>",
			action: function() {
				return this.$parent.wrapSelection("formatBlock", "<H1>");
			}
		},
		h2: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'>H2</button>",
			action: function() {
				return this.$parent.wrapSelection("formatBlock", "<H2>");
			}
		},
		h3: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'>H3</button>",
			action: function() {
				return this.$parent.wrapSelection("formatBlock", "<H3>");
			}
		},
		p: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'>P</button>",
			action: function() {
				return this.$parent.wrapSelection("formatBlock", "<P>");
			}
		},
		pre: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'>pre</button>",
			action: function() {
				return this.$parent.wrapSelection("formatBlock", "<PRE>");
			}
		},
		ul: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-list-ul'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("insertUnorderedList", null);
			}
		},
		ol: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-list-ol'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("insertOrderedList", null);
			}
		},
		quote: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-quote-right'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("formatBlock", "<BLOCKQUOTE>");
			}
		},
		undo: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-undo'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("undo", null);
			}
		},
		redo: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-repeat'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("redo", null);
			}
		},
		bold: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-bold'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("bold", null);
			},
			activeState: function() {
				return $document[0].queryCommandState('bold');
			}
		},
		justifyLeft: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-align-left'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("justifyLeft", null);
			},
			activeState: function() {
				return $document[0].queryCommandState('justifyLeft');
			}
		},
		justifyRight: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-align-right'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("justifyRight", null);
			},
			activeState: function() {
				return $document[0].queryCommandState('justifyRight');
			}
		},
		justifyCenter: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-align-center'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("justifyCenter", null);
			},
			activeState: function() {
				return $document[0].queryCommandState('justifyCenter');
			}
		},
		italics: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-italic'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("italic", null);
			},
			activeState: function() {
				return $document[0].queryCommandState('italic');
			}
		},
		clear: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-ban'></i></button>",
			action: function() {
				return this.$parent.wrapSelection("FormatBlock", "<div>");
			}
		},
		insertImage: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-picture-o'></i></button>",
			action: function() {
				var imageLink;
				imageLink = prompt("Please enter an image URL to insert", 'http://');
				if (imageLink !== '') {
					return this.$parent.wrapSelection('insertImage', imageLink);
				}
			}
		},
		insertLink: {
			display: "<button type='button' ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-chain'></i></button>",
			action: function() {
				var urlLink;
				urlLink = prompt("Please enter an URL to insert", 'http://');
				if (urlLink !== '') {
					return this.$parent.wrapSelection('createLink', urlLink);
				}
			}
		}
	}, ($rootScope.textAngularTools != null)? $rootScope.textAngularTools : {});
		
	return {
		require: 'ngModel',
		scope: {},
		restrict: "EA",
		link: function(scope, element, attrs, ngModel) {
			var group, groupElement, keydown, keyup, tool, toolElement; //all these vars should not be accessable outside this directive
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
					if (!scope.showHtml) scope.updateTaBindtext(); // only update if NOT in html mode
				},
				showHtml: false
			});
			// setup the options from the optional attributes
			if (!!attrs.taToolbar)					scope.toolbar = scope.$eval(attrs.taToolbar);
			if (!!attrs.taToolbarClass)				scope.classes.toolbar = attrs.taToolbarClass;
			if (!!attrs.taToolbarGroupClass)		scope.classes.toolbarGroup = attrs.taToolbarGroupClass;
			if (!!attrs.taToolbarButtonClass)		scope.classes.toolbarButton = attrs.taToolbarButtonClass;
			if (!!attrs.taToolbarActiveButtonClass)	scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass;
			if (!!attrs.taTextEditorClass)			scope.classes.textEditor = attrs.taTextEditorClass;
			if (!!attrs.taHtmlEditorClass)			scope.classes.htmlEditor = attrs.taHtmlEditorClass;
			
			// Setup the HTML elements as variable references for use later
			scope.displayElements = {
				toolbar: angular.element("<div></div>"),
				forminput: angular.element("<input type='hidden' style='display: none;'>"),
				html: angular.element("<pre contentEditable='true' ng-show='showHtml' ta-bind='html' ng-model='html' ></pre>"),
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
			
			// compile the scope with the text and html elements only - if we do this with the main element it causes a compile loop
			$compile(scope.displayElements.text)(scope);
			$compile(scope.displayElements.html)(scope);
			
			// add the classes manually last
			element.addClass("ta-root");
			scope.displayElements.toolbar.addClass("ta-toolbar " + scope.classes.toolbar);
			scope.displayElements.text.addClass("ta-text ta-editor " + scope.classes.textEditor);
			scope.displayElements.html.addClass("ta-html ta-editor " + scope.classes.textEditor);
			
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
							if(this.name !== 'html') return this.$parent.showHtml;
							return false;
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
			
			scope.$watch('text', function(newValue, oldValue){
				scope.html = newValue;
				ngModel.$setViewValue(newValue);
				scope.displayElements.forminput.val(newValue);
			});
			scope.$watch('html', function(newValue, oldValue){
				scope.text = newValue;
				ngModel.$setViewValue(newValue);
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
				if (this.bUpdateSelectedStyles) $timeout(this.updateSelectedStyles, 200); // used to update the active state when a key is held down, ie the left arrow
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
}).directive('taBind', function($sce, $sanitize, $document, taFixChrome){
	// ngSanitize is a requirement for the module so this shouldn't cause any trouble
	var sanitizationWrapper = function(html) {
		return $sce.trustAsHtml(html);
	};
	
	return {
		require: 'ngModel',
		scope: {'taBind': '@'},
		link: function(scope,element,attrs,ngModel){
			// in here we are undoing the converts used elsewhere to prevent the < > and & being displayed when they shouldn't in the code.
			var compileHtml = function(){
				var result = taFixChrome(angular.element("<div>").append(element.html())).html();
				if(scope.taBind !== 'text') result = result.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, '&');
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
			element.on('keyup', function(e){
				ngModel.$setViewValue(compileHtml());
			});
			
			ngModel.$parsers.push(function(value){
				// all the code here takes the information from the above keyup function or any other time that the viewValue is updated and parses it for storage in the ngModel
				if(ngModel.$oldViewValue === undefined) ngModel.$oldViewValue = value;
				if(scope.taBind === 'text' && value !== ngModel.$oldViewValue){//WYSIWYG Mode and view is changed
					if(value === undefined || value === '') return value;
					//this code is specifically to catch the insertion of < and > which need to be converted to &lt; and &gt; respectively
					// finds the end of the difference
					var end;
					for(end = 0; end < Math.min(value.length, ngModel.$oldViewValue.length); end++){
						var oldViewEnd = ngModel.$oldViewValue.length - end;
						if(value.charAt(value.length - end) !== ngModel.$oldViewValue.charAt(oldViewEnd)){
							// note: value never has &gt; or &lt;, oldViewValue ALLWAYS has them. This code dynamically equates < to &lt; and > to &gt;
							if((value.charAt(value.length - end) === '<' && ngModel.$oldViewValue.substring(oldViewEnd - 4, oldViewEnd) === '&lt;') || ( value.charAt(value.length - end) === '>' && ngModel.$oldViewValue.substring(oldViewEnd - 4, oldViewEnd) === '&gt;')){
								value = value.substring(0,value.length - end) + ngModel.$oldViewValue.substring(oldViewEnd - 4, oldViewEnd) + value.substring(value.length - end + 1);
								end += 3;
							}else break;
						}else if(value.charAt(value.length - end) === '>' && value.substring(value.length - end - 1, value.length - end + 1) === '>>') break; //specific catch for inserting a '<' just before an invisible html tag
					}
					// finds the first difference from the start of the text.
					var start;
					for(start = 0; start < Math.min(value.length, ngModel.$oldViewValue.length) && Math.min(value.length, ngModel.$oldViewValue.length) - end > start; start++){
						if(value.charAt(start) !== ngModel.$oldViewValue.charAt(start)){
							// note: value never has &gt; or &lt;, oldViewValue ALLWAYS has them. This code dynamically equates < to &lt; and > to &gt;
							if((value.charAt(start) === '<' && ngModel.$oldViewValue.substring(start, start + 4) === '&lt;') || ( value.charAt(start) === '>' && ngModel.$oldViewValue.substring(start, start + 4) === '&gt;')){
								value = value.substring(0,start) + ngModel.$oldViewValue.substring(start, start + 4) + value.substring(start + 1);
								start += 3;
							}else break;
						}else if(value.charAt(start) === '<' && value.substring(start, start + 2) === '<<') break; //specific catch for inserting a '<' just before an invisible html tag
					}
					// get the inserted text
					var insert = value.substring(start, value.length - end + 1);
					// doesn't match on deletes, but this code is for when we are INSERTING < or >. The <= 3 is a catch so for when deleting lines - so a large difference as it's 1+ html tags, the normal human won't hit more than 2 keys at the same time by accident that usually includes a < or >.
					if((insert.match(/[<>]/gi) && insert.length <= 3) || insert.match(/^[<>]+$/gi)){
						value = value.substring(0,start) + insert.replace(/</g, "&lt;").replace(/>/g, "&gt;") + value.substring(value.length - end + 1);
						ngModel.$oldViewValue = value;
						ngModel.$setViewValue(value); // don't forget to update the view
					}
				}else{// don't need to do much when updating in RAW Html mode, but this catches some errors.
					try{
						$sanitize(value); // this is what runs when ng-bind-html is used on the variable
					}catch(e){
						return ngModel.$oldViewValue; //prevents the errors occuring when we are typing in html code
					}
				}
				ngModel.$oldViewValue = value;
				return value;
			});
			
			// changes to the model variable from outside the html/text inputs
			ngModel.$render = function() {
				if(ngModel.$viewValue === undefined) return;
				// if the editor isn't focused it needs to be updated, otherwise it's receiving user input
				if ($document[0].activeElement !== element[0]) {
					var val = ngModel.$viewValue || ''; // in case model is null
					ngModel.$oldViewValue = val;
					if(scope.taBind == 'text')//WYSIWYG Mode
						element.html(sanitizationWrapper(val));
					else
						element.html(sanitizationWrapper(val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, '&gt;')));
				}
			};
		}
	};
}).factory('taFixChrome', function(){
	var taFixChrome = function($html){ // should be an angular.element object, returns object for chaining convenience
		// fix the chrome trash that gets inserted sometimes
		var spans = angular.element($html).find('span'); // default wrapper is a span so find all of them
		for(var s = 0; s < spans.length; s++){
			var span = angular.element(spans[s]);
			if(span.attr('style') && span.attr('style').match(/line-height: 1.428571429;/i)){ // chrome specific string that gets inserted into the style attribute, other parts may vary.
				if(span.next().length > 0 && span.next()[0].tagName === 'BR') span.next().remove()
				span.replaceWith(span.html());
			}
		}
		var result = $html.html().replace(/style="[^"]*?line-height: 1.428571429;[^"]*"/ig, ''); // regex to replace ONLY offending styles - these can be inserted into various other tags on delete
		$html.html(result);
		return $html;
	};
	return taFixChrome;
});