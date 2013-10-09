textAngular
===========

A radically powerful Text-Editor/Wysiwyg editor for Angular.js! Create multiple editor instances, two-way-bind HTML content, watch editors for changes and more!

##How to Use:

1.Include textAngular.js in your project, alternatively grab all this code and throw it in your "directives.js" module file.
2.Create a div or something, and add the text-angular directive to it. ALSO add a text-angular-name="<YOUR TEXT EDITOR NAME>"
3.Create a textAngularOpts object and bind it to your local scope in the controller you want controlling textAngular
It should look something like:

```
$scope.textAngularOpts = {
..options go here..
}
```
4.IF YOU WANT ALL EDITORS TO HAVE INDIVIDUAL SETTINGS -> go to 6. Else go to 7.
5. Create the textAngularEditors property manually (it will get created regardless). Then add to it, a new property with the name of your editor you chose earlier,
if it was "coolMonkeyMan" it will look like this:

```
$scope.textAngularOpts = {
..options for ALL editors, unless they have their own property...
textAngularEditors : {
coolMonkeyMan : {
..options for this editor ALONE ...
}
}
}
```
7. Globally inherited settings for each editor or individual settings? Either way you'll need to supply some options!

**OPTIONS**
*html* <STRING> the default html to show in the editor on load (also will be the property to watch for HTML changes!!!)
*toolbar* <ARRAY of OBJECTS> holds the toolbar items to configure, more on that later
*disableStyle* <BOOLEAN> disable all styles on this editor
*theme* <OBJECT of OBJECTS> holds the theme objects, more on that later

###Toolbar Settings
The list of available tools in textAngular is large.

Add tools to the toolbar like:

toolbar : [
{title : "<i class='icon-code'></i>", name : "html"},
{title : "h1", name : "h1"},
{title : "h2", name : "h2"}
..and more
]
###OPTIONS**
title <STRING> Can be an angular express, html, or text. Use this to add icons to each tool i,e "<i class='icon-code'></i>"
name <STRING> the command, the tool name, has to be one of the following:

h1
h2
h3
p
pre
ul
ol
quote
undo
redo
b
justifyLeft
justifyRight
justifyCenter
i
clear
insertImage
insertHtml
createLink


####Theme settings**
Every piece of textAngular has a specific class you can grab and style in CSS.
However, you can also use the theme object to specify styling.
Each property takes a normal, jQuery-like CSS property object.
Heres an example :
theme : {
editor : {
"background" : "white",
"color" : "gray",
"text-align" : "left",
"border" : "3px solid rgba(2,2,2,0.2)",
"border-radius" : "5px",
"font-size" : "1.3em",
"font-family" : "Tahoma"
},
toolbar : {
..some styling...
},
toolbarItems : {
..some more styling...
}
}
}

####OPTIONS**

editor -> the actual editor element
toolbar -> the toolbar wrapper
toolbarItems -> each toolbar item
insertForm -> the form that holds the insert stuff
insertFormBtn -> the button that submits the insert stuff


####HOW TO GET THE HTML**

To actually get the model (watch or bind),
simply follow this model:

textAngularOpts.textAngularEditors.<YOUR EDITORS NAME>.html

so to bind the expression:

{{textAngularOpts.textAngularEditors.<YOUR EDITORS NAME>.html}}

or to $watch for changes:

$scope.$watch('textAngularOpts.textAngularEditors.<YOUR EDITORS NAME>.html', function(oldHTML, newHTML){
console.log("My new html is: "+newHTML);
});

