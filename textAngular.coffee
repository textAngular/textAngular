###
textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.1.0

Requirements: Angular 1.2.0, Angular ngSanitize module
Optional Requirements: Bootstrap 3.0.0 and font-awesome for styling if you are using the default classes and icons.

How to Use:

1. Include textAngular.js in your project, alternatively grab all this code and throw it in your directives.js module file.
2. In your HTML instantiate textAngular as an attribute or element, the only required attribute is the ta-model which is the variable to bind the content of the editor to.
3. I reccommend using the following CSS in your stylesheet or a variant of to display the text box nicely:
	
.ta-editor{
	min-height: 300px;
	height: auto;
	overflow: auto;
	font-family: inherit;
	font-size: 100%;
}

4. Have fun!

Setting Options:

Several options can be set through attributes on the HTML tag, these are;
	- ta-toolbar: this should evaluate to an array of arrays. Each element is the name of one of the toolbar tools. The default is: [['h1', 'h2', 'h3', 'p', 'pre', 'bold', 'italics', 'ul', 'ol', 'redo', 'undo', 'clear'],['html', 'insertImage', 'insertLink']]
	- ta-toolbar-class: this is the class to apply to the overall div of the toolbar, defaults to "btn-toolbar". Note that the class "ta-toolbar" is also added to the toolbar.
	- ta-toolbar-group-class: this is the class to apply to the nested groups in the toolbar, a div with this class is created for each nested array in the ta-toolbar array and then the tool buttons are nested inside the group, defaults to "btn-group".
	- ta-toolbar-button-class: this is the class to apply to each tool button in the toolbar, defaults to: "btn btn-default"
	- ta-toolbar-active-button-class: this is the class to apply to each tool button in the toolbar if it's activeState function returns true ie when a tool function is applied to the selected text, defaults to: "active".
	- ta-text-editor-class: this is the class to apply to the text editor <pre>, defaults to "form-control". Note that the classes: ta-editor and ta-text are also added.
	- ta-html-editor-class: this is the class to apply to the html editor <div>, defaults to "form-control". Note that the classes: ta-editor and ta-html are also added.

The defaults can be changed by altering/overwriting the variable: $rootScope.textAngularOpts which acts like global defaults for the classes and toolbar.
The default value for this is: 
	$rootScope.textAngularOpts = {
		toolbar: [['h1', 'h2', 'h3', 'p', 'pre', 'bold', 'italics', 'ul', 'ol', 'redo', 'undo', 'clear'],['html', 'insertImage', 'insertLink']],
		classes: {
			toolbar: "btn-toolbar",
			toolbarGroup: "btn-group",
			toolbarButton: "btn btn-default",
			toolbarButtonActive: "active",
			textEditor: 'form-control',
			htmlEditor: 'form-control'
		}
	}

The toolbar buttons are defined in the object variable $rootScope.textAngularTools.
The following is an example of how to add a button to make the selected text red:
`
$rootScope.textAngularTools.colourRed = {
	display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-square' style='color: red;'></i></button>",
	action: function(){
		this.$parent.wrapSelection('formatBlock', '<span style="color: red">');
	},
	activeState: function(){return false;} //This isn't required, and currently doesn't work reliably except for the html tag that doesn't rely on the cursor position.
};
//the following adds it to the toolbar to be displayed and used.
$rootScope.textAngularOpts.toolbar = [['h1', 'h2', 'h3', 'p', 'pre', 'bold', 'colourRed', 'italics', 'ul', 'ol', 'redo', 'undo', 'clear'],['html', 'insertImage', 'insertLink']];
`
To explain how this works, when we create a button we create an isolated child scope of the textAngular scope and extend it with the values in the tools object, we then compile the HTML in the display value with the newly created scope.
Note that the way any functions are called in the plugins the 'this' variable will allways point to the scope of the button ensuring that this.$parent will allways 
Here's the code we run for every tool:

`
toolElement = angular.element($rootScope.textAngularTools[tool].display);
toolElement.addClass(scope.classes.toolbarButton);
groupElement.append($compile(toolElement)(angular.extend scope.$new(true), $rootScope.textAngularTools[tool]));
`
###
textAngular = angular.module "textAngular", ['ngSanitize']
textAngular.directive "textAngular", ($compile, $sce, $window, $document, $rootScope, $timeout) ->
	console.log "Thank you for using textAngular! http://www.textangular.com"
	#Here we set up the global display defaults, make sure we don't overwrite any that the user may have already set.
	$rootScope.textAngularOpts = angular.extend
		toolbar: [['h1', 'h2', 'h3', 'p', 'pre', 'bold', 'italics', 'ul', 'ol', 'redo', 'undo', 'clear'],['html', 'insertImage', 'insertLink']]#nested groups
		classes:
			toolbar: "btn-toolbar"
			toolbarGroup: "btn-group"
			toolbarButton: "btn btn-default"
			toolbarButtonActive: "active"
			textEditor: 'form-control'
			htmlEditor: 'form-control'
	, if $rootScope.textAngularOpts? then $rootScope.textAngularOpts else {}
	
	$rootScope.textAngularTools = angular.extend
		html: 
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'>Toggle HTML</button>"
			action: ->
				@$parent.showHtml = not @$parent.showHtml
				if @$parent.showHtml
					ht = @$parent.displayElements.text.html()
					$timeout (=> #defer until the element is visible
						@$parent.displayElements.html[0].focus()
					), 100
				else
					ht = @$parent.displayElements.html.html()
					$timeout (=> #defer until the element is visible
						@$parent.displayElements.text[0].focus()
					), 100
				@$parent.compileHtml ht
			activeState: -> not @showHtml
		h1:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'>H1</button>"
			action: -> @$parent.wrapSelection "formatBlock", "<H1>"
		h2:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'>H2</button>"
			action: -> @$parent.wrapSelection "formatBlock", "<H2>"
		
		h3:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'>H3</button>"
			action: -> @$parent.wrapSelection "formatBlock", "<H3>"
		
		p:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'>P</button>"
			action: -> @$parent.wrapSelection "formatBlock", "<P>"
		
		pre:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'>pre</button>"
			action: -> @$parent.wrapSelection "formatBlock", "<PRE>"
		
		ul:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-list-ul'></i></button>"
			action: -> @$parent.wrapSelection "insertUnorderedList", null
		
		ol:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-list-ol'></i></button>"
			action: -> @$parent.wrapSelection "insertOrderedList", null
		
		quote:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-quote-right'></i></button>"
			action: -> @$parent.wrapSelection "formatBlock", "<BLOCKQUOTE>"
		
		undo:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-undo'></i></button>"
			action: -> @$parent.wrapSelection "undo", null
		
		redo:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-repeat'></i></button>"
			action: -> @$parent.wrapSelection "redo", null
		
		bold:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-bold'></i></button>"
			action: -> @$parent.wrapSelection "bold", null
			activeState: -> $document[0].queryCommandState 'bold'
		
		justifyLeft:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-align-left'></i></button>"
			action: -> @$parent.wrapSelection "justifyLeft", null
			activeState: -> $document[0].queryCommandState 'justifyLeft'
		
		justifyRight:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-align-right'></i></button>"
			action: -> @$parent.wrapSelection "justifyRight", null
			activeState: -> $document[0].queryCommandState 'justifyRight'
		
		justifyCenter:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-align-center'></i></button>"
			action: -> @$parent.wrapSelection "justifyCenter", null
			activeState: -> $document[0].queryCommandState 'justifyCenter'
		
		italics:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-italic'></i></button>"
			action: -> @$parent.wrapSelection "italic", null
			activeState: -> $document[0].queryCommandState 'italic'
		
		clear:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-ban'></i></button>"
			action: -> @$parent.wrapSelection "FormatBlock", "<div>"
		insertImage:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-picture-o'></i></button>"
			action: ->
				imageLink = prompt "Please enter an image URL to insert", 'http://'
				if imageLink isnt '' then @$parent.wrapSelection  'insertImage', imageLink
		insertLink:
			display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-chain'></i></button>"
			action: ->
				urlLink = prompt "Please enter an URL to insert", 'http://'
				if urlLink isnt '' then @$parent.wrapSelection  'createLink', urlLink
	, if $rootScope.textAngularTools? then $rootScope.textAngularTools else {}
	
	#ngSanitize is a requirement so we don't need to check for it anymore
	sanitizationWrapper = (html) -> $sce.trustAsHtml html
	
	scope:
		model: "=taModel"
	
	restrict: "EA"
	link: (scope, element, attrs) ->
		#setup defaults and optional vars
		angular.extend scope, $rootScope.textAngularOpts,
			compileHtml: (html) ->
				compHtml = angular.element("<div>").append(html).html().replace(/(class="(.*?)")|(class='(.*?)')/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/style=("|')(.*?)("|')/g, "")
				if @showHtml is "load"
					@text = sanitizationWrapper compHtml
					@html = sanitizationWrapper compHtml.replace /</g, "&lt;"
					@showHtml = (@showHtmlDefault or false)
				else if @showHtml
					@text = sanitizationWrapper compHtml
				else
					@html = sanitizationWrapper compHtml.replace /</g, "&lt;"
				@model = compHtml
			#wraps the selection in the provided tag
			wrapSelection: (command, opt, updateDisplay=true) ->
				document.execCommand command, false, opt
				if @showHtml then @displayElements.text[0].focus() else @displayElements.html[0].focus()
				if updateDisplay then @updateDisplay()
			updateDisplay: -> @compileHtml if not @showHtml then @displayElements.html.html() else @displayElements.text.html()
			showHtml: false
			displayActiveToolClass: (active) -> if active then @classes.toolbarButtonActive else ''
		
		if (!!attrs.taToolbar) then scope.toolbar = scope.$eval attrs.taToolbar #should evaluate to an array of arrays of names
		if (!!attrs.taToolbarClass) then scope.classes.toolbar = attrs.taToolbarClass
		if (!!attrs.taToolbarGroupClass) then scope.classes.toolbarGroup = attrs.taToolbarGroupClass
		if (!!attrs.taToolbarButtonClass) then scope.classes.toolbarButton = attrs.taToolbarButtonClass
		if (!!attrs.taToolbarActiveButtonClass) then scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass
		if (!!attrs.taTextEditorClass) then scope.classes.textEditor = attrs.taTextEditorClass
		if (!!attrs.taHtmlEditorClass) then scope.classes.htmlEditor = attrs.taHtmlEditorClass
		
		#setup the template
		scope.displayElements =
			toolbar: angular.element "<div></div>"
			text: angular.element "<pre contentEditable='true' ng-show='showHtml' ng-bind-html='html' ></pre>"
			html: angular.element "<div contentEditable='true' ng-hide='showHtml' ng-bind-html='text' ></div>"
		element.append scope.displayElements.toolbar
		element.append scope.displayElements.text
		element.append scope.displayElements.html
		$compile(scope.displayElements.text) scope
		$compile(scope.displayElements.html) scope
		#if we do this before $compile we can get some oddities with classes causing directive compile loops if the user isn't careful with his/her class names
		element.addClass "ta-root"
		scope.displayElements.toolbar.addClass "ta-toolbar #{scope.classes.toolbar}"
		scope.displayElements.text.addClass "ta-text ta-editor #{scope.classes.textEditor}"
		scope.displayElements.html.addClass "ta-html ta-editor #{scope.classes.textEditor}"
		
		#add the tools to the toolbar afterwards to ensure that we scope correctly
		for group in scope.toolbar
			groupElement = angular.element "<div></div>"
			groupElement.addClass scope.classes.toolbarGroup
			for tool in group
				toolElement = angular.element $rootScope.textAngularTools[tool].display
				toolElement.addClass scope.classes.toolbarButton
				toolElement.attr 'unselectable', 'on' #so we maintain the text selection/position when clicking a button
				groupElement.append $compile(toolElement) angular.extend scope.$new(true), $rootScope.textAngularTools[tool]
			scope.displayElements.toolbar.append groupElement
		scope.$watch "model", ((newVal, oldVal) ->
			if not ($document[0].activeElement is scope.displayElements.html[0]) and not ($document[0].activeElement is scope.displayElements.text[0]) #if the editors aren't focussed they need to be updated, otherwise they are doing the updating
				scope.text = sanitizationWrapper newVal
				scope.html = sanitizationWrapper newVal.replace /</g, "&lt;"
		), true
		
		scope.compileHtml scope.model
		scope.bUpdateSelectedStyles = false
		scope.updateSelectedStyles = -> #This doesn't quite work correctly. The actives aren't showing up
			($rootScope.textAngularTools[tool].active = if $rootScope.textAngularTools[tool].activeState? then $rootScope.textAngularTools[tool].activeState.apply(scope) else false) for tool in groups for groups in scope.toolbar
			if @bUpdateSelectedStyles then $timeout @updateSelectedStyles, 200 #runs every 200 ms
		
		keydown = (e) -> #start timeout polling the style of the carat
			scope.bUpdateSelectedStyles = true
			scope.updateSelectedStyles()
		scope.displayElements.html.on 'keydown', keydown
		scope.displayElements.text.on 'keydown', keydown
		keyup = (e) ->
			scope.bUpdateSelectedStyles = false
			scope.$apply -> scope.updateDisplay()
		scope.displayElements.html.on 'keyup', keyup
		scope.displayElements.text.on 'keyup', keyup