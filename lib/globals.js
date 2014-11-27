					
// IE version detection - http://stackoverflow.com/questions/4169160/javascript-ie-detection-why-not-use-simple-conditional-comments
// We need this as IE sometimes plays funny tricks with the contenteditable.
// ----------------------------------------------------------
// If you're not in IE (or IE version is less than 5) then:
// ie === undefined
// If you're in IE (>=5) then you can determine which version:
// ie === 7; // IE7
// Thus, to detect IE:
// if (ie) {}
// And to detect the version:
// ie === 6 // IE6
// ie > 7 // IE8, IE9, IE10 ...
// ie < 9 // Anything less than IE9
// ----------------------------------------------------------
/* istanbul ignore next: untestable browser check */
var _browserDetect = {
	ie: (function(){
		var undef,
			v = 3,
			div = document.createElement('div'),
			all = div.getElementsByTagName('i');
		
		while (
			div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
			all[0]
		);
		
		return v > 4 ? v : undef;
	}()),
	webkit: /AppleWebKit\/([\d.]+)/i.test(navigator.userAgent)
};

// fix a webkit bug, see: https://gist.github.com/shimondoodkin/1081133
// this is set true when a blur occurs as the blur of the ta-bind triggers before the click
var globalContentEditableBlur = false;
/* istanbul ignore next: Browser Un-Focus fix for webkit */
if(_browserDetect.webkit) {
	document.addEventListener("mousedown", function(_event){
		var e = _event || window.event;
		var curelement = e.target;
		if(globalContentEditableBlur && curelement !== null){
			var isEditable = false;
			var tempEl = curelement;
			while(tempEl !== null && tempEl.tagName.toLowerCase() !== 'html' && !isEditable){
				isEditable = tempEl.contentEditable === 'true';
				tempEl = tempEl.parentNode;
			}
			if(!isEditable){
				document.getElementById('textAngular-editableFix-010203040506070809').setSelectionRange(0, 0); // set caret focus to an element that handles caret focus correctly.
				curelement.focus(); // focus the wanted element.
				if (curelement.select) {
					curelement.select(); // use select to place cursor for input elements.
				}
			}
		}	
		globalContentEditableBlur = false;
	}, false); // add global click handler
	angular.element(document).ready(function () {
		angular.element(document.body).append(angular.element('<input id="textAngular-editableFix-010203040506070809" style="width:1px;height:1px;border:none;margin:0;padding:0;position:absolute; top: -10000px; left: -10000px;" unselectable="on" tabIndex="-1">'));
	});
}

// Gloabl to textAngular REGEXP vars for block and list elements.

var BLOCKELEMENTS = /^(address|article|aside|audio|blockquote|canvas|dd|div|dl|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|noscript|ol|output|p|pre|section|table|tfoot|ul|video)$/ig;
var LISTELEMENTS = /^(ul|li|ol)$/ig;
var VALIDELEMENTS = /^(address|article|aside|audio|blockquote|canvas|dd|div|dl|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|noscript|ol|output|p|pre|section|table|tfoot|ul|video|li)$/ig;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Compatibility
/* istanbul ignore next: trim shim for older browsers */
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

// tests against the current jqLite/jquery implementation if this can be an element
function validElementString(string){
	try{
		return angular.element(string).length !== 0;
	}catch(any){
		return false;
	}
}

/*
	Custom stylesheet for the placeholders rules.
	Credit to: http://davidwalsh.name/add-rules-stylesheets
*/
var sheet, addCSSRule, removeCSSRule, _addCSSRule, _removeCSSRule;
/* istanbul ignore else: IE <8 test*/
if(_browserDetect.ie > 8 || _browserDetect.ie === undefined){
	var _sheets = document.styleSheets;
	/* istanbul ignore next: preference for stylesheet loaded externally */
	for(var i = 0; i < _sheets.length; i++){
		if(_sheets[i].media.length === 0 || _sheets[i].media.mediaText.match(/(all|screen)/ig)){
			if(_sheets[i].href){
				if(_sheets[i].href.match(/textangular\.(min\.|)css/ig)){
					sheet = _sheets[i];
					break;
				}
			}
		}
	}
	/* istanbul ignore next: preference for stylesheet loaded externally */
	if(!sheet){
		// this sheet is used for the placeholders later on.
		sheet = (function() {
			// Create the <style> tag
			var style = document.createElement("style");
			/* istanbul ignore else : WebKit hack :( */
			if(_browserDetect.webkit) style.appendChild(document.createTextNode(""));

			// Add the <style> element to the page, add as first so the styles can be overridden by custom stylesheets
			document.head.appendChild(style);

			return style.sheet;
		})();
	}

	// use as: addCSSRule("header", "float: left");
	addCSSRule = function(selector, rules) {
		return _addCSSRule(sheet, selector, rules);
	};
	_addCSSRule = function(_sheet, selector, rules){
		var insertIndex;
		
		// This order is important as IE 11 has both cssRules and rules but they have different lengths - cssRules is correct, rules gives an error in IE 11
		/* istanbul ignore else: firefox catch */
		if(_sheet.cssRules) insertIndex = Math.max(_sheet.cssRules.length - 1, 0);
		else if(_sheet.rules) insertIndex = Math.max(_sheet.rules.length - 1, 0);
		
		/* istanbul ignore else: untestable IE option */
		if(_sheet.insertRule) {
			_sheet.insertRule(selector + "{" + rules + "}", insertIndex);
		}
		else {
			_sheet.addRule(selector, rules, insertIndex);
		}
		// return the index of the stylesheet rule
		return insertIndex;
	};

	removeCSSRule = function(index){
		_removeCSSRule(sheet, index);
	};
	_removeCSSRule = function(sheet, index){
		/* istanbul ignore else: untestable IE option */
		if(sheet.removeRule){
			sheet.removeRule(index);
		}else{
			sheet.deleteRule(index);
		}
	};
}

// recursive function that returns an array of angular.elements that have the passed attribute set on them
function getByAttribute(element, attribute){
	var resultingElements = [];
	var childNodes = element.children();
	if(childNodes.length){
		angular.forEach(childNodes, function(child){
			resultingElements = resultingElements.concat(getByAttribute(angular.element(child), attribute));
		});
	}
	if(element.attr(attribute) !== undefined) resultingElements.push(element);
	return resultingElements;
}