textAngular
===========

http://www.textangular.com

###Requirements

1. Angular 1.2.x
2. Angular Sanitize 1.2.x

###Optional requirements

1. Bootstrap 3.0 only for the default styles
2. Font-Awesome 4.0 for the default icons on the toolbar

###How to Use

1. Include textAngular.js or textAngular.min.js in your project then include it in your module: ```angular.module('myModule', ['textAngular'])```, alternatively grab all this code and throw it in your directives.js module file.
2. In your HTML instantiate textAngular as an attribute or element, the only required attribute is the ng-model which is the variable to bind the content of the editor to, like so: ```<div text-angular ng-model="html"></div>``` or ```<text-angular ng-model="html"/>``` this acts in a similar fashion to the input directive of angular so if you define a name attribute you can use form validation as if it was a regular input.
3. I recommend using the following CSS in your stylesheet or a variant of to display the text box nicely: 

```css
.ta-editor{
    min-height: 300px;
    height: auto;
    overflow: auto;
    font-family: inherit;
    font-size: 100%;
}
```
4. Have fun!
 
**Important Note:** In it's current state textAngular does not support the use of class or style attributes in the RAW html or in plugins.

###Setting Options

Several options can be set through attributes on the HTML tag, these are;

- `ta-toolbar`: this should evaluate to an array of arrays. Each element is the name of one of the toolbar tools. The default is: ```[['h1', 'h2', 'h3', 'p', 'pre', 'bold', 'italics', 'ul', 'ol', 'redo', 'undo', 'clear'],['html', 'insertImage', 'insertLink']]```
- `ta-toolbar-class`: this is the class to apply to the overall div of the toolbar, defaults to "btn-toolbar". Note that the class "ta-toolbar" is also added to the toolbar.
- `ta-toolbar-group-class`: this is the class to apply to the nested groups in the toolbar, a div with this class is created for each nested array in the ta-toolbar array and then the tool buttons are nested inside the group, defaults to "btn-group".
- `ta-toolbar-button-class`: this is the class to apply to each tool button in the toolbar, defaults to: "btn btn-default"
- `ta-toolbar-active-button-class`: this is the class to apply to each tool button in the toolbar if it's activeState function returns true ie when a tool function is applied to the selected text, defaults to: "active".
- `ta-text-editor-class`: this is the class to apply to the text editor pre tag, defaults to "form-control". Note that the classes: ta-editor and ta-text are also added.
- `ta-html-editor-class`: this is the class to apply to the html editor div tag, defaults to "form-control". Note that the classes: ta-editor and ta-html are also added.

The defaults can be changed by altering/overwriting the variable: $rootScope.textAngularOpts which acts like global defaults for the classes and toolbar.
The default value for this is:

```js
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
```

The toolbar buttons are defined in the object variable $rootScope.textAngularTools.
The following is an example of how to add a button to make the selected text red:

```js
$rootScope.textAngularTools.colourRed = {
	display: "<button ng-click='action()' ng-class='displayActiveToolClass(active)'><i class='fa fa-square' style='color: red;'></i></button>",
	action: function(){
		this.$parent.wrapSelection('formatBlock', '<span style="color: red">');
	},
	activeState: function(){return false;} //This isn't required, and currently doesn't work reliably except for the html tag that doesn't rely on the cursor position.
};
//the following adds it to the toolbar to be displayed and used.
$rootScope.textAngularOpts.toolbar = [['h1', 'h2', 'h3', 'p', 'pre', 'bold', 'colourRed', 'italics', 'ul', 'ol', 'redo', 'undo', 'clear'],['html', 'insertImage', 'insertLink']];
```

To explain how this works, when we create a button we create an isolated child scope of the textAngular scope and extend it with the values in the tools object, we then compile the HTML in the display value with the newly created scope.
Note that the way any functions are called in the plugins the 'this' variable will allways point to the scope of the button ensuring that this.$parent will allways 
Here's the code we run for every tool:

```js
toolElement = angular.element($rootScope.textAngularTools[tool].display);
toolElement.addClass(scope.classes.toolbarButton);
groupElement.append($compile(toolElement)(angular.extend scope.$new(true), $rootScope.textAngularTools[tool]));
```

####Issues?

textAngular uses ```execCommand``` for the rich-text functionality. 
That being said, its still a fairly experimental browser feature-set, and may not behave the same in all browsers - see http://tifftiff.de/contenteditable/compliance_test.html for a full compliance list.
It has been tested to work on Chrome, Safari, FF and IE8+.
If you find something, please let me know - throw me a message, or submit a issue request!


## License
This project is licensed under the [MIT license](http://opensource.org/licenses/MIT).



####Contributers

Special thanks to all the contributions thus far! 

Including those from:

[Slobodan Mišković](https://github.com/slobo)

[SimeonC](https://github.com/SimeonC)

[edouard-lopez](https://github.com/edouard-lopez)

[108ium](https://github.com/108ium)

[nadeeshacabral](https://github.com/nadeeshacabral) 
