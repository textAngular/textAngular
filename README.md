textAngular
===========

http://www.textangular.com

###Requirements

1. jQuery
2. $sce service for icon HTML ("on" by default with Angular 1.2.x)

##How to Use:

1. Include ```textAngular.js``` in your project, alternatively grab all this code and throw it in your "```directives.js```" module file.
2. Include ``textAngular`` in your main app module.
4. Create an element of some kind. (div, whatever, doesn't matter)
5. Add the ```text-angular``` attribute (directive) to it.
6. Add a ```text-angular-name="<YOUR TEXT EDITOR NAME>"``` attribute  to the element, as well.
7. Create a textAngularOpts object and bind it to your local scope in the controller you want controlling textAngular
It should look something like:

```javascript
$scope.textAngularOpts = {
..options go here..
}
```
7.**If you want all editors to share settings**: skip to 10

8.Create the ```textAngularEditors``` property manually (it will get created regardless, if you choose not to apply individual settings).

9.Then add to it, a new property with the name of your editor you chose earlier. For instance, if it was "coolMonkeyMan" it will look like this:

```javascript
$scope.textAngularOpts = {

<global options go here>

textAngularEditors :
{
  coolMonkeyMan : {

  <editor specific options go here>

}
}
}
```
10.Globally inherited settings for each editor or individual settings? Either way you'll need to supply some options!



###Global Options

**html** ```<STRING>``` the default html to show in the editor on load (also will be the property to watch for HTML changes!!!)

**toolbar** ```<ARRAY of OBJECTS>``` holds the toolbar items to configure, more on that later

**disableStyle** ```<BOOLEAN>``` disable all styles on this editor

**theme** ```<OBJECT of OBJECTS>``` holds the theme objects, more on that later



###Setting up the Toolbar

Add tools to the toolbar like:

```javascript
toolbar : [
{icon : "<i class='icon-code'></i>", name : "html", title='Toggle Html'},
{icon  : "h1", name : "h1", title='H1'}},
{icon : "h2", name : "h2", title='H2'}}
..and more
]
```

####Note

If you want to use ultra-sweet icons in the menu (like I did in the example) 
make sure to include fontAwesome!

And then use the proper syntax for the titles i,e ```<i class='icon-<icon name>'></i>```

Get it at: www.bootstrapcdn.com/#fontawesome


###Toolbar Options

**title** ```<STRING>``` A string for the title attribute per tooltip item

**icon** ```<STRING>``` Can be an angular express, html, or text. Use this to add icons to each tool i,e ```<i class='icon-code'></i>```

**name** ```<STRING>``` the command, the tool name, has to be one of the following:
```
html <- this one is used to toggle the html view, so i'd probably keep it ;-)
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
```

####Theming textAngular
Every piece of textAngular has a specific class you can grab and style in CSS.
However, you can also use the theme object to specify styling.
Each property takes a normal, jQuery-like CSS property object.
Heres an example :

```javascript
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
```


####Theme Options

**editor** ```<OBJECT>``` the actual editor element

**toolbar** ```<OBJECT>``` the toolbar wrapper

**toolbarItems** ```<OBJECT>``` each toolbar item

**insertForm** ```<OBJECT>``` the form that holds the insert stuff

**insertFormBtn** ```<OBJECT>``` the button that submits the insert stuff



####How to get the Editor Html

To actually get the model (watch or bind),
simply follow this model:

```textAngularOpts.textAngularEditors.<YOUR EDITORS NAME>.html```

so to bind the expression:

```javascript
{{textAngularOpts.textAngularEditors.<YOUR EDITORS NAME>.html}}
```

or to ```$watch``` for changes:

```javascript
$scope.$watch('textAngularOpts.textAngularEditors.<YOUR EDITORS NAME>.html', function(oldHTML, newHTML){
console.log("My new html is: "+newHTML);
});
```

####How to set the Editor Html (new in 1.0.2)

Seeting the model is very similar to getting it, 
simple grab your model html object and do:

```javascript
$scope.textAngularOpts.textAngularEditors.<YOUR EDITORS NAME>.html = "new stuff";
```


####Issues?

textAngular uses ```execCommand``` for the rich-text functionalty. 
That being said, its still a fairly experimental browser feature-set, and may not behave the same in all browsers.
I've tested in FF, chrome and IE10 and its works as expected. 
If you find something, please let me know.
Throw me a message, or submit a issue request!


## License
This project is licensed under the [MIT license](http://opensource.org/licenses/MIT).
