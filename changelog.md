###Changelog

2014-02-28 v1.2.0

- Lots and Lots of changes, too many to list. Structural changes and added functionality. Supports down to IE8 and all other browsers.

2013-12-11 v1.1.2

- Updated to work correctly with IE (console.log bug)

2013-12-11 v1.1.2-pre3

- Added support for .focussed class and ng-focus to allow dynamic styling on focus events. #47
- Updates to fix Angular.JS breaking with parameter renaming minification. #49
- Minor bug fix to disable links from being 'clickable' in the editor.
- Updated the default toolbar to include ALL default tools.
- Update the tools to use activeState better.
- Small update to allow use of ta-bind outside of textAngular.
- Changed the raw html view to use a text-area for better compatability.

2013-12-09 v1.1.2-pre2

- Added input for form submission. #43
- Slight restructure and update into of /demo.
- Moved a lot of the README.md to the online Wiki. #34
- Changed pre-release tag names to -preX as we aren't really doing alpha - beta - RC format.

2013-12-05 v1.1.2-alpha (v1.1.2-pre1)

- Added bundled demo pages.
- Fixed Escaping of < and > #30
- Fixed stripping of style and class attributes and other parsing issues whilst maintaining the chrome fixes. #35 #30 #5
- Fixed two-way-binding not working #38
- Updated Readme.md and consolidated the readme out of the textAngular.js file.

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
