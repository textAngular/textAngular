###Changelog

2013-12-2 v1.1.1

- Fixed buttons still submitting form. #29
- Fix for Null ngModel value. Thanks to @slobo #22
- Added Ability to override just "display" for default button set. Thanks to @slobo #27

2013-11-9 v1.1.0

- Re-written to only depend on Angular and Angular-Sanitize. No More jQuery.
- Re-worked to be more angular-esq in it's initiation and use. Less reliance on global variables except for defaults and more use of bindings on attributes.
- Default styles are Bootstrap 3 classes, options to change these classes.
- Restructured the Toolbar to make it more plugin friendly, all tool buttons are encapsulated in their own scope that is a child of the individual textAngular bound scope.

2013-11-6 v1.0.3

- $sce isn't required anymore* Thanks to @nadeeshacabral
- bower support added* Thanks to @edouard-lopez

2013-10-11 v1.0.2

- Fixed issue with images not calling the compileHTML method*
- Fixed issue in chrome where styling was getting added for unordered lists*
- You can now change the model from the outside and have it affect the textAngular instance contents*
- Cleaned up code*

2013-10-10 v1.0.1 

- Added Tooltip Option, title has been renamed icon, and title is now the tooltip*
- The minified version actually works now*
