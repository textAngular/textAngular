textAngular v1.2.2
===========

[![Build Status](https://travis-ci.org/fraywing/textAngular.png?branch=master)](https://travis-ci.org/fraywing/textAngular) [![Coverage Status](https://coveralls.io/repos/fraywing/textAngular/badge.png)](https://coveralls.io/r/fraywing/textAngular)


Demo is available at: http://www.textangular.com

#### This readme is for the v1.2.x release, if you are looking for the v1.2.0 readme go here: https://github.com/fraywing/textAngular/tree/v1.2.0

## Requirements

1. `AngularJS` ≥ `1.2.x`

### Optional requirements

1. [Bootstrap 3.x](http://getbootstrap.com/) for the default styles
2. [Font-Awesome 4.x](http://fortawesome.github.io/Font-Awesome/) for the default icons on the toolbar
3. [Rangy 1.x](https://code.google.com/p/rangy/) for better activeState detection and more dynamic plugins, also the selectionsaverestore module.

### Where to get it

**NOTE:** Our `textAngular-sanitize.js` and angular.js's `angular-sanitize.js` are the SAME file, you must include one or the other but not both. We highly recommend using `textAngular-sanitize.js` as it loosens some parts of the sanitizer that are far too strict for our uses and adds some more features we need.

**Via Bower:**

Run `bower install textAngular` from the command line.
Include script tags similar to the following:
```html
<script src='/bower_components/textAngular/dist/textAngular-sanitize.min.js'></script>
<script src='/bower_components/textAngular/dist/textAngular.min.js'></script>
```

**Via CDNJS:**

Include script tags similar to the following:
```html
	<script src='http://cdnjs.cloudflare.com/ajax/libs/textAngular/1.2.2/textAngular-sanitize.min.js'></script>
<script src='http://cdnjs.cloudflare.com/ajax/libs/textAngular/1.2.2/textAngular.min.js'></script>
```

**Via jsDelivr:**

Include script tag similar to the following: (For details on how this works see: [https://github.com/jsdelivr/jsdelivr#load-multiple-files-with-single-http-request](https://github.com/jsdelivr/jsdelivr#load-multiple-files-with-single-http-request))
```html
<script src='http://cdn.jsdelivr.net/g/angular.textangular@1.2.2(textAngular-sanitize.min.js+textAngular.min.js)'></script>
```

**Via Github**

Download the code from [https://github.com/fraywing/textAngular/releases/latest](https://github.com/fraywing/textAngular/releases/latest), unzip the files then add script tags similar to the following:
```html
<script src='/path/to/unzipped/files/textAngular-sanitize.min.js'></script>
<script src='/path/to/unzipped/files/textAngular.min.js'></script>
```

### Usage

1. Include `textAngular-sanitize.js` or `textAngular-sanitize.min.js` in your project using script tags
2. Include `textAngularSetup.js` and `textAngular.js` or `textAngular.min.js` (textAngularSetup.js is included inside textAngular.min.js)
3. Add a dependency to `textAngular` in your app module, for example: ```angular.module('myModule', ['textAngular'])```.
4. Create an element to hold the editor and add an `ng-model="htmlVariable"` attribute where `htmlVariable` is the scope variable that will hold the HTML entered into the editor:
```html
<div text-angular ng-model="htmlVariable"></div>
```
OR
```html
<text-angular ng-model="htmlVariable"></text-angular>
```
This acts similar to a regular AngularJS / form input if you give it a name attribute, allowing for form submission and AngularJS form validation.

Have fun!
 
**Important Note:** Though textAngular supports the use of all attributes in it's input, please note that angulars ng-bind-html **WILL** strip out all of your style attributes if you are using `angular-sanitize.js`.

For Additional options see the [github Wiki](https://github.com/fraywing/textAngular/wiki).

### Issues?

textAngular uses ```execCommand``` for the rich-text functionality. 
That being said, its still a fairly experimental browser feature-set, and may not behave the same in all browsers - see http://tifftiff.de/contenteditable/compliance_test.html for a full compliance list.
It has been tested to work on Chrome, Safari, Opera, Firefox and Internet Explorer 8+.
If you find something, please let me know - throw me a message, or submit a issue request!

### FAQ

1. **Youtube Insert embeds a ```<img>``` tag and aren't showing the video.**<br/>
The problems with iFrames are that they are a security risk so the sanitizer by default strips them out. Instead of changing the sanitizer to allow iFrames we use a placeholder for youtube videos which has the added advantage of allowing you to edit their size and placement in the editor. To display the youtube videos when you aren't in the editor use the following html: ```<div ta-bind ng-model="data.htmlcontent"></div>```. This invokes our custom renderers to convert the ```<img>``` tags back into the youtube video you expect.

## Developer Notes

When checking out, you need a node.js installation, running `npm install` will get you setup with everything to run the unit tests and minification.

## License

This project is licensed under the [MIT license](http://opensource.org/licenses/MIT).


## Contributers

Special thanks to all the contributions thus far! 

For a full list see: https://github.com/fraywing/textAngular/graphs/contributors
