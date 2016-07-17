
// tests against the current jqLite/jquery implementation if this can be an element
function validElementString(string){
	try{
		return angular.element(string).length !== 0;
	}catch(any){
		return false;
	}
}
// setup the global contstant functions for setting up the toolbar

// all tool definitions
var taTools = {};
/*
	A tool definition is an object with the following key/value parameters:
		action: [function(deferred, restoreSelection)]
				a function that is executed on clicking on the button - this will allways be executed using ng-click and will
				overwrite any ng-click value in the display attribute.
				The function is passed a deferred object ($q.defer()), if this is wanted to be used `return false;` from the action and
				manually call `deferred.resolve();` elsewhere to notify the editor that the action has finished.
				restoreSelection is only defined if the rangy library is included and it can be called as `restoreSelection()` to restore the users
				selection in the WYSIWYG editor.
		display: [string]?
				Optional, an HTML element to be displayed as the button. The `scope` of the button is the tool definition object with some additional functions
				If set this will cause buttontext and iconclass to be ignored
		class: [string]?
				Optional, if set will override the taOptions.classes.toolbarButton class.
		buttontext: [string]?
				if this is defined it will replace the contents of the element contained in the `display` element
		iconclass: [string]?
				if this is defined an icon (<i>) will be appended to the `display` element with this string as it's class
		tooltiptext: [string]?
				Optional, a plain text description of the action, used for the title attribute of the action button in the toolbar by default.
		activestate: [function(commonElement)]?
				this function is called on every caret movement, if it returns true then the class taOptions.classes.toolbarButtonActive
				will be applied to the `display` element, else the class will be removed
		disabled: [function()]?
				if this function returns true then the tool will have the class taOptions.classes.disabled applied to it, else it will be removed
	Other functions available on the scope are:
		name: [string]
				the name of the tool, this is the first parameter passed into taRegisterTool
		isDisabled: [function()]
				returns true if the tool is disabled, false if it isn't
		displayActiveToolClass: [function(boolean)]
				returns true if the tool is 'active' in the currently focussed toolbar
		onElementSelect: [Object]
				This object contains the following key/value pairs and is used to trigger the ta-element-select event
				element: [String]
					an element name, will only trigger the onElementSelect action if the tagName of the element matches this string
				filter: [function(element)]?
					an optional filter that returns a boolean, if true it will trigger the onElementSelect.
				action: [function(event, element, editorScope)]
					the action that should be executed if the onElementSelect function runs
*/
// name and toolDefinition to add into the tools available to be added on the toolbar
function registerTextAngularTool(name, toolDefinition){
	if(!name || name === '' || taTools.hasOwnProperty(name)) throw('textAngular Error: A unique name is required for a Tool Definition');
	if(
		(toolDefinition.display && (toolDefinition.display === '' || !validElementString(toolDefinition.display))) ||
		(!toolDefinition.display && !toolDefinition.buttontext && !toolDefinition.iconclass)
	)
		throw('textAngular Error: Tool Definition for "' + name + '" does not have a valid display/iconclass/buttontext value');
	taTools[name] = toolDefinition;
}

angular.module('textAngularSetup', [])
.constant('taRegisterTool', registerTextAngularTool)
.value('taTools', taTools)
// Here we set up the global display defaults, to set your own use a angular $provider#decorator.
.value('taOptions',  {
	//////////////////////////////////////////////////////////////////////////////////////
    // forceTextAngularSanitize
    // set false to allow the textAngular-sanitize provider to be replaced
    // with angular-sanitize or a custom provider.
	forceTextAngularSanitize: true,
	///////////////////////////////////////////////////////////////////////////////////////
	// keyMappings
	// allow customizable keyMappings for specialized key boards or languages
	//
	// keyMappings provides key mappings that are attached to a given commandKeyCode.
	// To modify a specific keyboard binding, simply provide function which returns true
	// for the event you wish to map to.
	// Or to disable a specific keyboard binding, provide a function which returns false.
	// Note: 'RedoKey' and 'UndoKey' are internally bound to the redo and undo functionality.
	// At present, the following commandKeyCodes are in use:
	// 98, 'TabKey', 'ShiftTabKey', 105, 117, 'UndoKey', 'RedoKey'
	//
	// To map to an new commandKeyCode, add a new key mapping such as:
	// {commandKeyCode: 'CustomKey', testForKey: function (event) {
	//  if (event.keyCode=57 && event.ctrlKey && !event.shiftKey && !event.altKey) return true;
	// } }
	// to the keyMappings. This example maps ctrl+9 to 'CustomKey'
	// Then where taRegisterTool(...) is called, add a commandKeyCode: 'CustomKey' and your
	// tool will be bound to ctrl+9.
	//
	// To disble one of the already bound commandKeyCodes such as 'RedoKey' or 'UndoKey' add:
	// {commandKeyCode: 'RedoKey', testForKey: function (event) { return false; } },
	// {commandKeyCode: 'UndoKey', testForKey: function (event) { return false; } },
	// to disable them.
	//
	keyMappings : [],
	toolbar: [
        ['bold', 'italics', 'underline', 'h3', 'ul', 'quote', 'insertLink', 'indent','outdent']
	],
	classes: {
		focussed: "focussed",
		toolbar: "btn-toolbar",
		toolbarGroup: "btn-group",
		toolbarButton: 'custom-ta-button',
		toolbarButtonActive: "active",
		disabled: "disabled",
		textEditor: 'form-control',
		htmlEditor: 'form-control'
	},
	defaultTagAttributes : {
		a: {target:""}
	},
	setup: {
		// wysiwyg mode
		textEditorSetup: function($element){ /* Do some processing here */ },
		// raw html
		htmlEditorSetup: function($element){ /* Do some processing here */ }
	},
	defaultFileDropHandler:
		{}
})

// This is the element selector string that is used to catch click events within a taBind, prevents the default and $emits a 'ta-element-select' event
// these are individually used in an angular.element().find() call. What can go here depends on whether you have full jQuery loaded or just jQLite with angularjs.
// div is only used as div.ta-insert-video caught in filter.
.value('taSelectableElements', ['a'])

// This is an array of objects with the following options:
//				selector: <string> a jqLite or jQuery selector string
//				customAttribute: <string> an attribute to search for
//				renderLogic: <function(element)>
// Both or one of selector and customAttribute must be defined.
.value('taCustomRenderers', [])

.value('taTranslations', {
	heading: {
		tooltip: 'H3 Heading'
	},
	p: {
		tooltip: 'Paragraph'
	},
	quote: {
		tooltip: 'Blockquote'
	},
	bold: {
		tooltip: 'Bold'
	},
	italic: {
		tooltip: 'Italic'
	},
	underline: {
		tooltip: 'Underline'
	},
	insertLink: {
		tooltip: 'Insert Link',
		dialogPrompt: "Please enter a URL to insert"
	},
	ul: {
		tooltip: 'Unordered List'
	},
	indent: {
		tooltip: 'Increase indent'
	},
	outdent: {
		tooltip: 'Decrease indent'
	},
	clear: {
		tooltip: 'Clear formatting'
	}
})
.run(['$templateCache', '$document', 'taRegisterTool', '$window', 'taTranslations', 'taSelection', '$timeout',
function($templateCache, $document, taRegisterTool, $window, taTranslations, taSelection, $timeout) {

	// add the Header tools
	// convenience functions so that the loop works correctly
	var _retActiveStateFunction = function(q){
		return function(){ return this.$editor().queryFormatBlockState(q); };
	};
	var headerAction = function(){
		return this.$editor().wrapSelection("formatBlock", "<" + this.name.toUpperCase() +">");
	};
	angular.forEach(['h3'], function(h){
		taRegisterTool(h.toLowerCase(), {
			iconclass: 'heading',
			tooltiptext: taTranslations.heading.tooltip + h.charAt(1),
			action: headerAction,
			activeState: _retActiveStateFunction(h.toLowerCase())
		});
	});
	taRegisterTool('quote', {
		iconclass: 'quote',
		tooltiptext: taTranslations.quote.tooltip,
		action: function(){
			return this.$editor().wrapSelection("formatBlock", "<BLOCKQUOTE>");
		},
		activeState: function(){ return this.$editor().queryFormatBlockState('blockquote'); }
	});

	taRegisterTool('p', {
		iconclass: 'text',
		tooltiptext: taTranslations.p.tooltip,
		action: function(){
			return this.$editor().wrapSelection("formatBlock", "<P>");
		},
		activeState: function(){ return this.$editor().queryFormatBlockState('p'); }
	});
	taRegisterTool('ul', {
		iconclass: 'list',
		tooltiptext: taTranslations.ul.tooltip,
		action: function(){
			return this.$editor().wrapSelection("insertUnorderedList", null);
		},
		activeState: function(){ return this.$editor().queryCommandState('insertUnorderedList'); },
		commandKeyCode: 990
	});

	taRegisterTool('bold', {
		iconclass: 'bold',
		tooltiptext: taTranslations.bold.tooltip,
		action: function(){
			return this.$editor().wrapSelection("bold", null);
		},
		activeState: function(){
			return this.$editor().queryCommandState('bold');
		},
		commandKeyCode: 98
	});

	taRegisterTool('indent', {
		display: '<span class="patreon-eliminate-dom"></span>',
		tooltiptext: taTranslations.indent.tooltip,
		action: function(){
			return this.$editor().wrapSelection("indent", null);
		},
		activeState: function(){
			return this.$editor().queryFormatBlockState('blockquote');
		},
		commandKeyCode: 999
	});
	taRegisterTool('outdent', {
		display: '<span class="patreon-eliminate-dom"></span>',
		tooltiptext: taTranslations.outdent.tooltip,
		action: function(){
			return this.$editor().wrapSelection("outdent", null);
		},
		activeState: function(){
			return false;
		},
		commandKeyCode: 998
	});
	taRegisterTool('italics', {
		iconclass: 'italic',
		tooltiptext: taTranslations.italic.tooltip,
		action: function(){
			return this.$editor().wrapSelection("italic", null);
		},
		activeState: function(){
			return this.$editor().queryCommandState('italic');
		},
		commandKeyCode: 105
	});
	taRegisterTool('underline', {
		iconclass: 'underline',
		tooltiptext: taTranslations.underline.tooltip,
		action: function(){
			return this.$editor().wrapSelection("underline", null);
		},
		activeState: function(){
			return this.$editor().queryCommandState('underline');
		},
		commandKeyCode: 117
	});

	taRegisterTool('insertLink', {
		tooltiptext: taTranslations.insertLink.tooltip,
		iconclass: 'link',
		action: function(){
			var urlLink;
			urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, 'http://');
			if(urlLink && urlLink !== '' && urlLink !== 'http://'){
				return this.$editor().wrapSelection('createLink', urlLink, true);
			}
		},
		activeState: function(commonElement){
			if(commonElement) return commonElement[0].tagName === 'A';
			return false;
		},
		onElementSelect: {
			element: 'a',
			action: function(event, $element, editorScope){
				function _getHrefString(element) {
					var href = element.attr('href');

					return 'href="' + href + '"';
				}

				function _getElementString(element) {
					angular.element(element).removeAttr('style', '');

					return element.outerHTML;
				}

				function _prepareHTMLforUpdate(prepareForUpdate) {
					prepareForUpdate = prepareForUpdate || false;

					if (prepareForUpdate) {
						angular.element($element[0]).attr('data-change-link-href', 'true');
					} else {
						angular.element($element[0]).removeAttr('data-change-link-href', '');
					}

					var target = $element[0];

					while (target.parentNode.tagName.toUpperCase() !== "DIV") {
						target = target.parentNode;
					}

					target = target.parentNode;

					editorScope.updateViewValue(target.innerHTML);
					editorScope.linkInnerText = $element.text();

					return target.innerHTML;
				}

				function _updateOriginalValues(){
					originalHref = _getHrefString($element);
					originalElement = _getElementString($element[0]);
				}

				function _updateHTML(href){
					var newElement = "";

					if (href === "") {
						var spanPlaceholderHTML = document.createElement('span');

						spanPlaceholderHTML.textContent = $element[0].innerText;
						newElement = spanPlaceholderHTML.outerHTML;
					} else {
						$element.attr('href', href).removeAttr('data-change-link-href');

						$element.text(editorScope.linkInnerText);

						var currentElement = _getElementString($element[0]),
						newHref = _getHrefString($element);

						newElement = (currentElement).replace(originalHref, newHref);
					}

					editorScope.updateLinkHTML(newElement, originalElement);
				}

				function _triggerClose(){
					Array.prototype.forEach.call(
						linkPopoverElement[0].querySelectorAll('.patreon-input'),
						function(node) {
							node.blur();
						}
					);
				}

				event.preventDefault();

				$element.attr('data-change-link-href', 'true');

				var linkPopoverContainer = editorScope.displayElements.popoverContainer,
				originalHref = _getHrefString($element),
				originalElement = _getElementString($element[0]);

				linkPopoverContainer.empty();

				var svgFromTemplateCache = $templateCache.get("icon-link.svg");

				var iconElement = document.createElement('i');

				iconElement.setAttribute('data-patreon-icon', 'link');
				iconElement.setAttribute('class', 'patreon-icon-size-small');
				iconElement.innerHTML = svgFromTemplateCache;

				var inputElement = document.createElement('input');

				inputElement.setAttribute('class', 'patreon-input patreon-input-size-fluid');
				inputElement.setAttribute('value', $element.attr('href'));

				var popoverElement = document.createElement('div');

				popoverElement.setAttribute('class', 'popover-input');
				popoverElement.innerHTML = iconElement.outerHTML + inputElement.outerHTML;

				var linkPopoverElement = angular.element(popoverElement.outerHTML);

				linkPopoverElement.bind('keyup', function(event){
					if (event.keyCode === 13) {
						linkPopoverElement.find('input').triggerHandler('blur');
					}
				});

				linkPopoverElement.find('input').bind('blur', function(event){
					_updateHTML(event.target.value);
					_updateOriginalValues();
					editorScope.hidePopover($element);
				});

				var leftOffset = $element[0].offsetLeft,
				topOffset = $element[0].offsetTop - 50,
				toolbarTag = 'ta-link-toolbar';

				Array.prototype.forEach.call(
					document.getElementsByClassName(toolbarTag),
					function(node) {
						node.style.left = String(leftOffset) + 'px';
						node.style.top = String(topOffset) + 'px';
					}
				);

				_prepareHTMLforUpdate(true);
				linkPopoverContainer.append(linkPopoverElement);
				editorScope.showPopover($element);
			}
		}
	});
}]);
