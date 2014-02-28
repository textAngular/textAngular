textAngular v1.2.0
===========

Demo is available at: http://www.textangular.com

## Requirements

1. `AngularJS` ≥ `1.2.x` ;
2. `Angular Sanitize` ≥ `1.2.x`.

### Optional requirements

1. [Bootstrap 3.x](http://getbootstrap.com/) for the default styles
2. [Font-Awesome 4.x](http://fortawesome.github.io/Font-Awesome/) for the default icons on the toolbar
3. [Rangy 1.x](https://code.google.com/p/rangy/) for better activeState detection and more dynamic plugins, also the selectionsaverestore module.

### Usage

1. Get textAngular via `bower install textAngular`, using the cdn at http://cdnjs.cloudflare.com/ajax/libs/textAngular/1.2.0/textAngular.min.js or from the github page https://github.com/fraywing/textAngular/releases/latest
2. Include textAngular.js or textAngular.min.js in your project using script tags
3. Add a dependency to `textAngular` in your app module, for example: ```angular.module('myModule', ['textAngular'])```.
4. Create an element to hold the editor and add an `ng-model="htmlVariable"` attribute where `htmtlVariable` is the scope variable that will hold the HTML entered into the editor:
```html
<div text-angular ng-model="htmlVariable"></div>
```
OR
```html
<text-angular ng-model="htmlVariable"></div>
```
This acts similar to a regular AngularJS / form input if you give it a name attribute, allowing for form submission and AngularJS form validation.

Have fun!
 
**Important Note:** Though textAngular supports the use of all attributes in it's input, please note that angulars ng-bind-html **WILL** strip out all of your style attributes.

For Additional options see the [github Wiki](https://github.com/fraywing/textAngular/wiki).

### Issues?

textAngular uses ```execCommand``` for the rich-text functionality. 
That being said, its still a fairly experimental browser feature-set, and may not behave the same in all browsers - see http://tifftiff.de/contenteditable/compliance_test.html for a full compliance list.
It has been tested to work on Chrome, Safari, Opera, Firefox and Internet Explorer 8+.
If you find something, please let me know - throw me a message, or submit a issue request!

## Developer Notes

When checking out, you need a node.js installation, running `npm install` will get you setup with everything to run the unit tests and minification.

## License

This project is licensed under the [MIT license](http://opensource.org/licenses/MIT).


## Contributers

Special thanks to all the contributions thus far! 

Including those from:

* [SimeonC](https://github.com/SimeonC)
* [slobo](https://github.com/slobo)
* [edouard-lopez](https://github.com/edouard-lopez)
* [108ium](https://github.com/108ium)
* [nadeeshacabral](https://github.com/nadeeshacabral) 
* [netbubu17](https://github.com/netbubu17)
* [worldspawn](https://github.com/worldspawn)
* [JonathanGawrych](https://github.com/JonathanGawrych)
* [kanakiyajay](https://github.com/kanakiyajay)
* [kencaron](https://github.com/kencaron)
* [gintau](https://github.com/gintau)
* [uxtx](https://github.com/uxtx)