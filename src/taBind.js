angular.module('textAngular.taBind', ['textAngular.factories', 'textAngular.DOM'])
.service('_taBlankTest', [function(){
	return function(_blankVal){
		// we radically restructure this code.
		// what was here before was incredibly fragile.
		// What we do now is to check that the html is non-blank visually
		// which we check by looking at html->text
		if(!_blankVal) return true;
		// find first non-tag match - ie start of string or after tag that is not whitespace
		// var t0 = performance.now();
		// Takes a small fraction of a mSec to do this...
		var _text_ = stripHtmlToText(_blankVal);
		// var t1 = performance.now();
		// console.log('Took', (t1 - t0).toFixed(4), 'milliseconds to generate:');
		if (_text_=== '') {
			// img generates a visible item so it is not blank!
			if (/<img[^>]+>/.test(_blankVal)) {
				return false;
			}
			return true;
		} else {
			return false;
		}
	};
}])
.directive('taButton', [function(){
	return {
		link: function(scope, element, attrs){
			element.attr('unselectable', 'on');
			element.on('mousedown', function(e, eventData){
				/* istanbul ignore else: this is for catching the jqLite testing*/
				if(eventData) angular.extend(e, eventData);
				// this prevents focusout from firing on the editor when clicking toolbar buttons
				e.preventDefault();
				return false;
			});
		}
	};
}])
.directive('taBind', [
		'taSanitize', '$timeout', '$document', 'taFixChrome', 'taBrowserTag',
		'taSelection', 'taSelectableElements', 'taApplyCustomRenderers', 'taOptions',
		'_taBlankTest', '$parse', 'taDOM', 'textAngularManager',
		function(
			taSanitize, $timeout, $document, taFixChrome, taBrowserTag,
			taSelection, taSelectableElements, taApplyCustomRenderers, taOptions,
			_taBlankTest, $parse, taDOM, textAngularManager){
	// Uses for this are textarea or input with ng-model and ta-bind='text'
	// OR any non-form element with contenteditable="contenteditable" ta-bind="html|text" ng-model
	return {
		priority: 2, // So we override validators correctly
		require: ['ngModel','?ngModelOptions'],
		link: function(scope, element, attrs, controller){
			var ngModel = controller[0];
			var ngModelOptions = controller[1] || {};
			// the option to use taBind on an input or textarea is required as it will sanitize all input into it correctly.
			var _isContentEditable = element.attr('contenteditable') !== undefined && element.attr('contenteditable');
			var _isInputFriendly = _isContentEditable || element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input';
			var _isReadonly = false;
			var _focussed = false;
			var _skipRender = false;
			var _disableSanitizer = attrs.taUnsafeSanitizer || taOptions.disableSanitizer;
			var _lastKey;
			// see http://www.javascripter.net/faq/keycodes.htm for good information
			// NOTE Mute On|Off 173 (Opera MSIE Safari Chrome) 181 (Firefox)
			// BLOCKED_KEYS are special keys...
			// Tab, pause/break, CapsLock, Esc, Page Up, End, Home,
			// Left arrow, Up arrow, Right arrow, Down arrow, Insert, Delete,
			// f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12
			// NumLock, ScrollLock
			var BLOCKED_KEYS = /^(9|19|20|27|33|34|35|36|37|38|39|40|45|112|113|114|115|116|117|118|119|120|121|122|123|144|145)$/i;
			// UNDO_TRIGGER_KEYS - spaces, enter, delete, backspace, all punctuation
			// Backspace, Enter, Space, Delete, (; :) (Firefox), (= +) (Firefox),
			// Numpad +, Numpad -, (; :), (= +),
			// (, <), (- _), (. >), (/ ?), (` ~), ([ {), (\ |), (] }), (' ")
			// NOTE - Firefox: 173 = (- _) -- adding this to UNDO_TRIGGER_KEYS
			var UNDO_TRIGGER_KEYS = /^(8|13|32|46|59|61|107|109|173|186|187|188|189|190|191|192|219|220|221|222)$/i;
			var _pasteHandler;

			// defaults to the paragraph element, but we need the line-break or it doesn't allow you to type into the empty element
			// non IE is '<p><br/></p>', ie is '<p></p>' as for once IE gets it correct...
			var _defaultVal, _defaultTest;

			var _CTRL_KEY = 0x0001;
			var _META_KEY = 0x0002;
			var _ALT_KEY = 0x0004;
			var _SHIFT_KEY = 0x0008;
			// KEYCODEs we use
			var _ENTER_KEYCODE = 13;
			var _SHIFT_KEYCODE = 16;
			var _TAB_KEYCODE = 9;
			var _LEFT_ARROW_KEYCODE = 37;
			var _RIGHT_ARROW_KEYCODE = 39;
			// map events to special keys...
			// mappings is an array of maps from events to specialKeys as declared in textAngularSetup
			var _keyMappings = [
				//		ctrl/command + z
				{
					specialKey: 'UndoKey',
					forbiddenModifiers: _ALT_KEY + _SHIFT_KEY,
					mustHaveModifiers: [_META_KEY + _CTRL_KEY],
					keyCode: 90
				},
				//		ctrl/command + shift + z
				{
					specialKey: 'RedoKey',
					forbiddenModifiers: _ALT_KEY,
					mustHaveModifiers: [_META_KEY + _CTRL_KEY, _SHIFT_KEY],
					keyCode: 90
				},
				//		ctrl/command + y
				{
					specialKey: 'RedoKey',
					forbiddenModifiers: _ALT_KEY + _SHIFT_KEY,
					mustHaveModifiers: [_META_KEY + _CTRL_KEY],
					keyCode: 89
				},
				//		TabKey
				{
					specialKey: 'TabKey',
					forbiddenModifiers: _META_KEY + _SHIFT_KEY + _ALT_KEY + _CTRL_KEY,
					mustHaveModifiers: [],
					keyCode: _TAB_KEYCODE
				},
				//		shift + TabKey
				{
					specialKey: 'ShiftTabKey',
					forbiddenModifiers: _META_KEY + _ALT_KEY + _CTRL_KEY,
					mustHaveModifiers: [_SHIFT_KEY],
					keyCode: _TAB_KEYCODE
				}
			];
			function _mapKeys(event) {
				var specialKey;
				_keyMappings.forEach(function (map){
					if (map.keyCode === event.keyCode) {
						var netModifiers = (event.metaKey ? _META_KEY: 0) +
							(event.ctrlKey ? _CTRL_KEY: 0) +
							(event.shiftKey ? _SHIFT_KEY: 0) +
							(event.altKey ? _ALT_KEY: 0);
						if (map.forbiddenModifiers & netModifiers) return;
						if (map.mustHaveModifiers.every(function (modifier) { return netModifiers & modifier; })){
							specialKey = map.specialKey;
						}
					}
				});
				return specialKey;
			}

			// set the default to be a paragraph value
			if(attrs.taDefaultWrap === undefined) attrs.taDefaultWrap = 'p';
			/* istanbul ignore next: ie specific test */
			if(attrs.taDefaultWrap === ''){
				_defaultVal = '';
				_defaultTest = (_browserDetect.ie === undefined)? '<div><br></div>' : (_browserDetect.ie >= 11)? '<p><br></p>' : (_browserDetect.ie <= 8)? '<P>&nbsp;</P>' : '<p>&nbsp;</p>';
			}else{
				_defaultVal = (_browserDetect.ie === undefined || _browserDetect.ie >= 11)?
					(attrs.taDefaultWrap.toLowerCase() === 'br' ? '<BR><BR>' : '<' + attrs.taDefaultWrap + '><br></' + attrs.taDefaultWrap + '>') :
					(_browserDetect.ie <= 8)?
						'<' + attrs.taDefaultWrap.toUpperCase() + '></' + attrs.taDefaultWrap.toUpperCase() + '>' :
						'<' + attrs.taDefaultWrap + '></' + attrs.taDefaultWrap + '>';
				_defaultTest = (_browserDetect.ie === undefined || _browserDetect.ie >= 11)?
					(attrs.taDefaultWrap.toLowerCase() === 'br' ? '<br><br>' : '<' + attrs.taDefaultWrap + '><br></' + attrs.taDefaultWrap + '>') :
					(_browserDetect.ie <= 8)?
						'<' + attrs.taDefaultWrap.toUpperCase() + '>&nbsp;</' + attrs.taDefaultWrap.toUpperCase() + '>' :
						'<' + attrs.taDefaultWrap + '>&nbsp;</' + attrs.taDefaultWrap + '>';
			}

			/* istanbul ignore else */
			if(!ngModelOptions.$options) ngModelOptions.$options = {}; // ng-model-options support

			var _ensureContentWrapped = function(value) {
				if (_taBlankTest(value)) return value;
				var domTest = angular.element("<div>" + value + "</div>");
				//console.log('domTest.children().length():', domTest.children().length);
				//console.log('_ensureContentWrapped', domTest.children());
				//console.log(value, attrs.taDefaultWrap);
				if (domTest.children().length === 0) {
					// if we have a <br> and the attrs.taDefaultWrap is a <p> we need to remove the <br>
					//value = value.replace(/<br>/i, '');
					value = "<" + attrs.taDefaultWrap + ">" + value + "</" + attrs.taDefaultWrap + ">";
				} else {
					var _children = domTest[0].childNodes;
					var i;
					var _foundBlockElement = false;
					for (i = 0; i < _children.length; i++) {
						if (_foundBlockElement = _children[i].nodeName.toLowerCase().match(BLOCKELEMENTS)) break;
					}
					if (!_foundBlockElement) {
						value = "<" + attrs.taDefaultWrap + ">" + value + "</" + attrs.taDefaultWrap + ">";
					}
					else{
						value = "";
						for(i = 0; i < _children.length; i++){
							var node = _children[i];
							var nodeName = node.nodeName.toLowerCase();
							//console.log('node#:', i, 'name:', nodeName);
							if(nodeName === '#comment') {
								value += '<!--' + node.nodeValue + '-->';
							} else if(nodeName === '#text') {
								// determine if this is all whitespace, if so, we will leave it as it is.
								// otherwise, we will wrap it as it is
								var text = node.textContent;
								if (!text.trim()) {
									// just whitespace
									value += text;
								} else {
									// not pure white space so wrap in <p>...</p> or whatever attrs.taDefaultWrap is set to.
									value += "<" + attrs.taDefaultWrap + ">" + text + "</" + attrs.taDefaultWrap + ">";
								}
							} else if(!nodeName.match(BLOCKELEMENTS)){
								/* istanbul ignore  next: Doesn't seem to trigger on tests */
								var _subVal = (node.outerHTML || node.nodeValue);
								/* istanbul ignore else: Doesn't seem to trigger on tests, is tested though */
								if(_subVal.trim() !== '')
									value += "<" + attrs.taDefaultWrap + ">" + _subVal + "</" + attrs.taDefaultWrap + ">";
								else value += _subVal;
							} else {
								value += node.outerHTML;
							}
							//console.log(value);
						}
					}
				}
				//console.log(value);
				return value;
			};

			if(attrs.taPaste) {
				_pasteHandler = $parse(attrs.taPaste);
			}

			element.addClass('ta-bind');

			var _undoKeyupTimeout;

			scope['$undoManager' + (attrs.id || '')] = ngModel.$undoManager = {
				_stack: [],
				_index: 0,
				_max: 1000,
				push: function(value){
					if((typeof value === "undefined" || value === null) ||
						((typeof this.current() !== "undefined" && this.current() !== null) && value === this.current())) return value;
					if(this._index < this._stack.length - 1){
						this._stack = this._stack.slice(0,this._index+1);
					}
					this._stack.push(value);
					if(_undoKeyupTimeout) $timeout.cancel(_undoKeyupTimeout);
					if(this._stack.length > this._max) this._stack.shift();
					this._index = this._stack.length - 1;
					return value;
				},
				undo: function(){
					return this.setToIndex(this._index-1);
				},
				redo: function(){
					return this.setToIndex(this._index+1);
				},
				setToIndex: function(index){
					if(index < 0 || index > this._stack.length - 1){
						return undefined;
					}
					this._index = index;
					return this.current();
				},
				current: function(){
					return this._stack[this._index];
				}
			};

			// in here we are undoing the converts used elsewhere to prevent the < > and & being displayed when they shouldn't in the code.
			var _compileHtml = function(){
				if(_isContentEditable) {
					return element[0].innerHTML;
				}
				if(_isInputFriendly) {
					return element.val();
				}
				throw ('textAngular Error: attempting to update non-editable taBind');
			};

			var selectorClickHandler = function(event){
				// emit the element-select event, pass the element
				scope.$emit('ta-element-select', this);
				event.preventDefault();
				return false;
			};

			//used for updating when inserting wrapped elements
			var _reApplyOnSelectorHandlers = scope['reApplyOnSelectorHandlers' + (attrs.id || '')] = function(){
				/* istanbul ignore else */
				if(!_isReadonly) angular.forEach(taSelectableElements, function(selector){
					// check we don't apply the handler twice
					element.find(selector)
						.off('click', selectorClickHandler)
						.on('click', selectorClickHandler);
				});
			};

			var _setViewValue = function(_val, triggerUndo, skipRender){
				_skipRender = skipRender || false;
				if(typeof triggerUndo === "undefined" || triggerUndo === null) triggerUndo = true && _isContentEditable; // if not contentEditable then the native undo/redo is fine
				if(typeof _val === "undefined" || _val === null) _val = _compileHtml();
				if(_taBlankTest(_val)){
					// this avoids us from tripping the ng-pristine flag if we click in and out with out typing
					if(ngModel.$viewValue !== '') ngModel.$setViewValue('');
					if(triggerUndo && ngModel.$undoManager.current() !== '') ngModel.$undoManager.push('');
				}else{
					_reApplyOnSelectorHandlers();
					if(ngModel.$viewValue !== _val){
						ngModel.$setViewValue(_val);
						if(triggerUndo) ngModel.$undoManager.push(_val);
					}
				}
				ngModel.$render();
			};

			var _setInnerHTML = function(newval){
				element[0].innerHTML = newval;
			};

			var _redoUndoTimeout;
			var _undo = scope['$undoTaBind' + (attrs.id || '')] = function(){
				/* istanbul ignore else: can't really test it due to all changes being ignored as well in readonly */
				if(!_isReadonly && _isContentEditable){
					var content = ngModel.$undoManager.undo();
					if(typeof content !== "undefined" && content !== null){
						_setInnerHTML(content);
						_setViewValue(content, false);
						if(_redoUndoTimeout) $timeout.cancel(_redoUndoTimeout);
						_redoUndoTimeout = $timeout(function(){
							element[0].focus();
							taSelection.setSelectionToElementEnd(element[0]);
						}, 1);
					}
				}
			};

			var _redo = scope['$redoTaBind' + (attrs.id || '')] = function(){
				/* istanbul ignore else: can't really test it due to all changes being ignored as well in readonly */
				if(!_isReadonly && _isContentEditable){
					var content = ngModel.$undoManager.redo();
					if(typeof content !== "undefined" && content !== null){
						_setInnerHTML(content);
						_setViewValue(content, false);
						/* istanbul ignore next */
						if(_redoUndoTimeout) $timeout.cancel(_redoUndoTimeout);
						_redoUndoTimeout = $timeout(function(){
							element[0].focus();
							taSelection.setSelectionToElementEnd(element[0]);
						}, 1);
					}
				}
			};

			//used for updating when inserting wrapped elements
			scope['updateTaBind' + (attrs.id || '')] = function(){
				if(!_isReadonly) _setViewValue(undefined, undefined, true);
			};

			// catch DOM XSS via taSanitize
			// Sanitizing both ways is identical
			var _sanitize = function(unsafe){
				return (ngModel.$oldViewValue = taSanitize(taFixChrome(unsafe), ngModel.$oldViewValue, _disableSanitizer));
			};

			// trigger the validation calls
			if(element.attr('required')) ngModel.$validators.required = function(modelValue, viewValue) {
				return !_taBlankTest(modelValue || viewValue);
			};
			// parsers trigger from the above keyup function or any other time that the viewValue is updated and parses it for storage in the ngModel
			ngModel.$parsers.push(_sanitize);
			ngModel.$parsers.unshift(_ensureContentWrapped);
			// because textAngular is bi-directional (which is awesome) we need to also sanitize values going in from the server
			ngModel.$formatters.push(_sanitize);
			ngModel.$formatters.unshift(_ensureContentWrapped);
			ngModel.$formatters.unshift(function(value){
				return ngModel.$undoManager.push(value || '');
			});

			//this code is used to update the models when data is entered/deleted
			if(_isInputFriendly){
				scope.events = {};
				if(!_isContentEditable){
					// if a textarea or input just add in change and blur handlers, everything else is done by angulars input directive
					element.on('change blur', scope.events.change = scope.events.blur = function(){
						if(!_isReadonly) ngModel.$setViewValue(_compileHtml());
					});

					element.on('keydown', scope.events.keydown = function(event, eventData){
						/* istanbul ignore else: this is for catching the jqLite testing*/
						if(eventData) angular.extend(event, eventData);
						// Reference to http://stackoverflow.com/questions/6140632/how-to-handle-tab-in-textarea
						/* istanbul ignore else: otherwise normal functionality */
						if(event.keyCode === _TAB_KEYCODE){ // tab was pressed
							// get caret position/selection
							var start = this.selectionStart;
							var end = this.selectionEnd;

							var value = element.val();
							if(event.shiftKey){
								// find \t
								var _linebreak = value.lastIndexOf('\n', start), _tab = value.lastIndexOf('\t', start);
								if(_tab !== -1 && _tab >= _linebreak){
									// set textarea value to: text before caret + tab + text after caret
									element.val(value.substring(0, _tab) + value.substring(_tab + 1));

									// put caret at right position again (add one for the tab)
									this.selectionStart = this.selectionEnd = start - 1;
								}
							}else{
								// set textarea value to: text before caret + tab + text after caret
								element.val(value.substring(0, start) + "\t" + value.substring(end));

								// put caret at right position again (add one for the tab)
								this.selectionStart = this.selectionEnd = start + 1;
							}
							// prevent the focus lose
							event.preventDefault();
						}
					});

					var _repeat = function(string, n){
						var result = '';
						for(var _n = 0; _n < n; _n++) result += string;
						return result;
					};

					// add a forEach function that will work on a NodeList, etc..
					var forEach = function (array, callback, scope) {
						for (var i= 0; i<array.length; i++) {
							callback.call(scope, i, array[i]);
						}
					};

					// handle <ul> or <ol> nodes
					var recursiveListFormat = function(listNode, tablevel){
						var _html = '';
						var _subnodes = listNode.childNodes;
						tablevel++;
						// tab out and add the <ul> or <ol> html piece
						_html += _repeat('\t', tablevel-1) + listNode.outerHTML.substring(0, 4);
						forEach(_subnodes, function (index, node) {
							/* istanbul ignore next: browser catch */
							var nodeName = node.nodeName.toLowerCase();
							if (nodeName === '#comment') {
								_html += '<!--' + node.nodeValue + '-->';
								return;
							}
							if (nodeName === '#text') {
								_html += node.textContent;
								return;
							}
							/* istanbul ignore next: not tested, and this was original code -- so not wanting to possibly cause an issue, leaving it... */
							if(!node.outerHTML) {
								// no html to add
								return;
							}
							if(nodeName === 'ul' || nodeName === 'ol') {
								_html += '\n' + recursiveListFormat(node, tablevel);
							}
							else {
								// no reformatting within this subnode, so just do the tabing...
								_html += '\n' + _repeat('\t', tablevel) + node.outerHTML;
							}
						});
						// now add on the </ol> or </ul> piece
						_html += '\n' + _repeat('\t', tablevel-1) + listNode.outerHTML.substring(listNode.outerHTML.lastIndexOf('<'));
						return _html;
					};
					// handle formating of something like:
					// <ol><!--First comment-->
					//  <li>Test Line 1<!--comment test list 1--></li>
					//    <ul><!--comment ul-->
					//      <li>Nested Line 1</li>
					//        <!--comment between nested lines--><li>Nested Line 2</li>
					//    </ul>
					//  <li>Test Line 3</li>
					// </ol>
					ngModel.$formatters.unshift(function(htmlValue){
						// tabulate the HTML so it looks nicer
						//
						// first get a list of the nodes...
						// we do this by using the element parser...
						//
						// doing this -- which is simpiler -- breaks our tests...
						//var _nodes=angular.element(htmlValue);
						var _nodes = angular.element('<div>' + htmlValue + '</div>')[0].childNodes;
						if(_nodes.length > 0){
							// do the reformatting of the layout...
							htmlValue = '';
							forEach(_nodes, function (index, node) {
								var nodeName = node.nodeName.toLowerCase();
								if (nodeName === '#comment') {
									htmlValue += '<!--' + node.nodeValue + '-->';
									return;
								}
								if (nodeName === '#text') {
									htmlValue += node.textContent;
									return;
								}
								/* istanbul ignore next: not tested, and this was original code -- so not wanting to possibly cause an issue, leaving it... */
								if(!node.outerHTML)
								{
									// nothing to format!
									return;
								}
								if(htmlValue.length > 0) {
									// we aready have some content, so drop to a new line
									htmlValue += '\n';
								}
								if(nodeName === 'ul' || nodeName === 'ol') {
									// okay a set of list stuff we want to reformat in a nested way
									htmlValue += '' + recursiveListFormat(node, 0);
								}
								else {
									// just use the original without any additional formating
									htmlValue += '' + node.outerHTML;
								}
							});
						}
						return htmlValue;
					});
				}else{
					// all the code specific to contenteditable divs
					var _processingPaste = false;
					/* istanbul ignore next: phantom js cannot test this for some reason */
					var processpaste = function(text) {
                       var _isOneNote = text!==undefined? text.match(/content=["']*OneNote.File/i): false;
						/* istanbul ignore else: don't care if nothing pasted */
                        //console.log(text);
						if(text && text.trim().length){
							// test paste from word/microsoft product
							if(text.match(/class=["']*Mso(Normal|List)/i) || text.match(/content=["']*Word.Document/i) || text.match(/content=["']*OneNote.File/i)){
								var textFragment = text.match(/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/i);
								if(!textFragment) textFragment = text;
								else textFragment = textFragment[1];
								textFragment = textFragment.replace(/<o:p>[\s\S]*?<\/o:p>/ig, '').replace(/class=(["']|)MsoNormal(["']|)/ig, '');
								var dom = angular.element("<div>" + textFragment + "</div>");
								var targetDom = angular.element("<div></div>");
								var _list = {
									element: null,
									lastIndent: [],
									lastLi: null,
									isUl: false
								};
								_list.lastIndent.peek = function(){
									var n = this.length;
									if (n>0) return this[n-1];
								};
								var _resetList = function(isUl){
									_list.isUl = isUl;
									_list.element = angular.element(isUl ? "<ul>" : "<ol>");
									_list.lastIndent = [];
									_list.lastIndent.peek = function(){
										var n = this.length;
										if (n>0) return this[n-1];
									};
									_list.lastLevelMatch = null;
								};
								for(var i = 0; i <= dom[0].childNodes.length; i++){
									if(!dom[0].childNodes[i] || dom[0].childNodes[i].nodeName === "#text"){
										continue;
									} else {
										var tagName = dom[0].childNodes[i].tagName.toLowerCase();
										if(tagName !== "p" &&
											tagName !== "h1" &&
											tagName !== "h2" &&
											tagName !== "h3" &&
											tagName !== "h4" &&
											tagName !== "h5" &&
											tagName !== "h6" &&
										    tagName !== "table"){
											continue;
										}
									}
									var el = angular.element(dom[0].childNodes[i]);
									var _listMatch = (el.attr('class') || '').match(/MsoList(Bullet|Number|Paragraph)(CxSp(First|Middle|Last)|)/i);

									if(_listMatch){
										if(el[0].childNodes.length < 2 || el[0].childNodes[1].childNodes.length < 1){
											continue;
										}
										var isUl = _listMatch[1].toLowerCase() === "bullet" || (_listMatch[1].toLowerCase() !== "number" && !(/^[^0-9a-z<]*[0-9a-z]+[^0-9a-z<>]</i.test(el[0].childNodes[1].innerHTML) || /^[^0-9a-z<]*[0-9a-z]+[^0-9a-z<>]</i.test(el[0].childNodes[1].childNodes[0].innerHTML)));
										var _indentMatch = (el.attr('style') || '').match(/margin-left:([\-\.0-9]*)/i);
										var indent = parseFloat((_indentMatch)?_indentMatch[1]:0);
										var _levelMatch = (el.attr('style') || '').match(/mso-list:l([0-9]+) level([0-9]+) lfo[0-9+]($|;)/i);
										// prefers the mso-list syntax

										if(_levelMatch && _levelMatch[2]) indent = parseInt(_levelMatch[2]);

										if ((_levelMatch && (!_list.lastLevelMatch || _levelMatch[1] !== _list.lastLevelMatch[1])) || !_listMatch[3] || _listMatch[3].toLowerCase() === "first" || (_list.lastIndent.peek() === null) || (_list.isUl !== isUl && _list.lastIndent.peek() === indent)) {
											_resetList(isUl);
											targetDom.append(_list.element);
										} else if (_list.lastIndent.peek() != null && _list.lastIndent.peek() < indent){
											_list.element = angular.element(isUl ? "<ul>" : "<ol>");
											_list.lastLi.append(_list.element);
										} else if (_list.lastIndent.peek() != null && _list.lastIndent.peek() > indent){
											while(_list.lastIndent.peek() != null && _list.lastIndent.peek() > indent){
												if(_list.element.parent()[0].tagName.toLowerCase() === 'li'){
													_list.element = _list.element.parent();
													continue;
												}else if(/[uo]l/i.test(_list.element.parent()[0].tagName.toLowerCase())){
													_list.element = _list.element.parent();
												}else{ // else it's it should be a sibling
													break;
												}
												_list.lastIndent.pop();
											}
											_list.isUl = _list.element[0].tagName.toLowerCase() === "ul";
											if (isUl !== _list.isUl) {
												_resetList(isUl);
												targetDom.append(_list.element);
											}
										}

										_list.lastLevelMatch = _levelMatch;
										if(indent !== _list.lastIndent.peek()) _list.lastIndent.push(indent);
										_list.lastLi = angular.element("<li>");
										_list.element.append(_list.lastLi);
										_list.lastLi.html(el.html().replace(/<!(--|)\[if !supportLists\](--|)>[\s\S]*?<!(--|)\[endif\](--|)>/ig, ''));
										el.remove();
									}else{
										_resetList(false);
										targetDom.append(el);
									}
								}
								var _unwrapElement = function(node){
									node = angular.element(node);
									for(var _n = node[0].childNodes.length - 1; _n >= 0; _n--) node.after(node[0].childNodes[_n]);
									node.remove();
								};

								angular.forEach(targetDom.find('span'), function(node){
									node.removeAttribute('lang');
									if(node.attributes.length <= 0) _unwrapElement(node);
								});
								angular.forEach(targetDom.find('font'), _unwrapElement);

                                text = targetDom.html();
                                if(_isOneNote){
                                    text = targetDom.html() || dom.html();
                                }
								// LF characters instead of spaces in some spots and they are replaced by "/n", so we need to just swap them to spaces
								text = text.replace(/\n/g, ' ');
							}else{
								// remove unnecessary chrome insert
								text = text.replace(/<(|\/)meta[^>]*?>/ig, '');
								if(text.match(/<[^>]*?(ta-bind)[^>]*?>/)){
									// entire text-angular or ta-bind has been pasted, REMOVE AT ONCE!!
									if(text.match(/<[^>]*?(text-angular)[^>]*?>/)){
										var _el = angular.element("<div>" + text + "</div>");
										_el.find('textarea').remove();
										var binds = taDOM.getByAttribute(_el, 'ta-bind');
										for(var _b = 0; _b < binds.length; _b++){
											var _target = binds[_b][0].parentNode.parentNode;
											for(var _c = 0; _c < binds[_b][0].childNodes.length; _c++){
												_target.parentNode.insertBefore(binds[_b][0].childNodes[_c], _target);
											}
											_target.parentNode.removeChild(_target);
										}
										text = _el.html().replace('<br class="Apple-interchange-newline">', '');
									}
								}else if(text.match(/^<span/)){
									// in case of pasting only a span - chrome paste, remove them. THis is just some wierd formatting
									// if we remove the '<span class="Apple-converted-space"> </span>' here we destroy the spacing
									// on paste from even ourselves!
									if (!text.match(/<span class=(\"Apple-converted-space\"|\'Apple-converted-space\')>.<\/span>/ig)) {
										text = text.replace(/<(|\/)span[^>]*?>/ig, '');
									}
								}
								// Webkit on Apple tags
								text = text.replace(/<br class="Apple-interchange-newline"[^>]*?>/ig, '').replace(/<span class="Apple-converted-space">( |&nbsp;)<\/span>/ig, '&nbsp;');
							}

							if (/<li(\s.*)?>/i.test(text) && /(<ul(\s.*)?>|<ol(\s.*)?>).*<li(\s.*)?>/i.test(text) === false) {
								// insert missing parent of li element
								text = text.replace(/<li(\s.*)?>.*<\/li(\s.*)?>/i, '<ul>$&</ul>');
							}

							// parse whitespace from plaintext input, starting with preceding spaces that get stripped on paste
							text = text.replace(/^[ |\u00A0]+/gm, function (match) {
								var result = '';
								for (var i = 0; i < match.length; i++) {
									result += '&nbsp;';
								}
								return result;
							}).replace(/\n|\r\n|\r/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');

							if(_pasteHandler) text = _pasteHandler(scope, {$html: text}) || text;

							// turn span vertical-align:super into <sup></sup>
							text = text.replace(/<span style=("|')([^<]*?)vertical-align\s*:\s*super;?([^>]*?)("|')>([^<]+?)<\/span>/g, "<sup style='$2$3'>$5</sup>");

							text = taSanitize(text, '', _disableSanitizer);
							//console.log('DONE\n', text);

							taSelection.insertHtml(text, element[0]);
							$timeout(function(){
								ngModel.$setViewValue(_compileHtml());
								_processingPaste = false;
								element.removeClass('processing-paste');
							}, 0);
						}else{
							_processingPaste = false;
							element.removeClass('processing-paste');
						}
					};

					element.on('paste', scope.events.paste = function(e, eventData){
						/* istanbul ignore else: this is for catching the jqLite testing*/
						if(eventData) angular.extend(e, eventData);
						if(_isReadonly || _processingPaste){
							e.stopPropagation();
							e.preventDefault();
							return false;
						}

						// Code adapted from http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718#6804718
						_processingPaste = true;
						element.addClass('processing-paste');
						var pastedContent;
						var clipboardData = (e.originalEvent || e).clipboardData;
						if (clipboardData && clipboardData.getData && clipboardData.types.length > 0) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
							var _types = "";
							for(var _t = 0; _t < clipboardData.types.length; _t++){
								_types += " " + clipboardData.types[_t];
							}
							/* istanbul ignore next: browser tests */
							if (/text\/html/i.test(_types)) {
								pastedContent = clipboardData.getData('text/html');
							} else if (/text\/plain/i.test(_types)) {
								pastedContent = clipboardData.getData('text/plain');
							}

							processpaste(pastedContent);
							e.stopPropagation();
							e.preventDefault();
							return false;
						} else {// Everything else - empty editdiv and allow browser to paste content into it, then cleanup
							var _savedSelection = rangy.saveSelection(),
								_tempDiv = angular.element('<div class="ta-hidden-input" contenteditable="true"></div>');
							$document.find('body').append(_tempDiv);
							_tempDiv[0].focus();
							$timeout(function(){
								// restore selection
								rangy.restoreSelection(_savedSelection);
								processpaste(_tempDiv[0].innerHTML);
								element[0].focus();
								_tempDiv.remove();
							}, 0);
						}
					});
					element.on('cut', scope.events.cut = function(e){
						// timeout to next is needed as otherwise the paste/cut event has not finished actually changing the display
						if(!_isReadonly) $timeout(function(){
							ngModel.$setViewValue(_compileHtml());
						}, 0);
						else e.preventDefault();
					});

					element.on('keydown', scope.events.keydown = function(event, eventData){
						/* istanbul ignore else: this is for catching the jqLite testing*/
						if(eventData) angular.extend(event, eventData);
                        if (event.keyCode === _SHIFT_KEYCODE) {
                            taSelection.setStateShiftKey(true);
                        } else {
                            taSelection.setStateShiftKey(false);
                        }
						event.specialKey = _mapKeys(event);
						var userSpecialKey;
						/* istanbul ignore next: difficult to test */
						taOptions.keyMappings.forEach(function (mapping) {
							if (event.specialKey === mapping.commandKeyCode) {
								// taOptions has remapped this binding... so
								// we disable our own
								event.specialKey = undefined;
							}
							if (mapping.testForKey(event)) {
								userSpecialKey = mapping.commandKeyCode;
							}
							if ((mapping.commandKeyCode === 'UndoKey') || (mapping.commandKeyCode === 'RedoKey')) {
								// this is necessary to fully stop the propagation.
								if (!mapping.enablePropagation) {
									event.preventDefault();
								}
							}
						});
						/* istanbul ignore next: difficult to test */
						if (typeof userSpecialKey !== 'undefined') {
							event.specialKey = userSpecialKey;
						}
						/* istanbul ignore next: difficult to test as can't seem to select */
						if ((typeof event.specialKey !== 'undefined') && (
								event.specialKey !== 'UndoKey' || event.specialKey !== 'RedoKey'
							)) {
							event.preventDefault();
							textAngularManager.sendKeyCommand(scope, event);
						}
						/* istanbul ignore else: readonly check */
						if(!_isReadonly){
							if (event.specialKey==='UndoKey') {
								_undo();
								event.preventDefault();
							}
							if (event.specialKey==='RedoKey') {
								_redo();
								event.preventDefault();
							}
							/* istanbul ignore next: difficult to test as can't seem to select */
							if(event.keyCode === _ENTER_KEYCODE && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey)
							{
								var contains = function(a, obj) {
									for (var i = 0; i < a.length; i++) {
										if (a[i] === obj) {
											return true;
										}
									}
									return false;
								};
								var $selection;
								var selection = taSelection.getSelectionElement();
								// shifted to nodeName here from tagName since it is more widely supported see: http://stackoverflow.com/questions/4878484/difference-between-tagname-and-nodename
								if(!selection.nodeName.match(VALIDELEMENTS)) return;
								var _new = angular.element(_defaultVal);
								// if we are in the last element of a blockquote, or ul or ol and the element is blank
								// we need to pull the element outside of the said type
								var moveOutsideElements = ['blockquote', 'ul', 'ol'];
								if (contains(moveOutsideElements, selection.parentNode.tagName.toLowerCase())) {
									if (/^<br(|\/)>$/i.test(selection.innerHTML.trim()) && !selection.nextSibling) {
										// if last element is blank, pull element outside.
										$selection = angular.element(selection);
										var _parent = $selection.parent();
										_parent.after(_new);
										$selection.remove();
										if (_parent.children().length === 0) _parent.remove();
										taSelection.setSelectionToElementStart(_new[0]);
										event.preventDefault();
									}
									if (/^<[^>]+><br(|\/)><\/[^>]+>$/i.test(selection.innerHTML.trim())) {
										$selection = angular.element(selection);
										$selection.after(_new);
										$selection.remove();
										taSelection.setSelectionToElementStart(_new[0]);
										event.preventDefault();
									}
								}
							}
						}
					});
					var _keyupTimeout;
					element.on('keyup', scope.events.keyup = function(event, eventData){
						/* istanbul ignore else: this is for catching the jqLite testing*/
						if(eventData) angular.extend(event, eventData);
						taSelection.setStateShiftKey(false);	// clear the ShiftKey state
						/* istanbul ignore next: FF specific bug fix */
						if (event.keyCode === _TAB_KEYCODE) {
							var _selection = taSelection.getSelection();
							if(_selection.start.element === element[0] && element.children().length) taSelection.setSelectionToElementStart(element.children()[0]);
							return;
						}
						// we do this here during the 'keyup' so that the browser has already moved the slection by one character...
						if (event.keyCode === _LEFT_ARROW_KEYCODE && !event.shiftKey) {
							taSelection.updateLeftArrowKey(element);
						}
						// we do this here during the 'keyup' so that the browser has already moved the slection by one character...
						if (event.keyCode === _RIGHT_ARROW_KEYCODE && !event.shiftKey) {
							taSelection.updateRightArrowKey(element);
						}
						if(_undoKeyupTimeout) $timeout.cancel(_undoKeyupTimeout);
						if(!_isReadonly && !BLOCKED_KEYS.test(event.keyCode)){
							/* istanbul ignore next: Ignore any _ENTER_KEYCODE that has ctrlKey, metaKey or alKey */
							if (event.keyCode === _ENTER_KEYCODE && (event.ctrlKey || event.metaKey || event.altKey)) {
								// we ignore any ENTER_	KEYCODE that is anything but plain or a shift one...
							} else {
								// if enter - insert new taDefaultWrap, if shift+enter insert <br/>
								if(_defaultVal !== '' && _defaultVal !== '<BR><BR>' && event.keyCode === _ENTER_KEYCODE && !event.ctrlKey && !event.metaKey && !event.altKey){
									var selection = taSelection.getSelectionElement();
									while(!selection.nodeName.match(VALIDELEMENTS) && selection !== element[0]){
										selection = selection.parentNode;
									}
									if(!event.shiftKey){
										// new paragraph, br should be caught correctly
										// shifted to nodeName here from tagName since it is more widely supported see: http://stackoverflow.com/questions/4878484/difference-between-tagname-and-nodename
										//console.log('Enter', selection.nodeName, attrs.taDefaultWrap, selection.innerHTML.trim());
										if(selection.tagName.toLowerCase() !==
											attrs.taDefaultWrap &&
											selection.nodeName.toLowerCase() !== 'li' &&
											(selection.innerHTML.trim() === '' || selection.innerHTML.trim() === '<br>')
										) {
											// Chrome starts with a <div><br></div> after an EnterKey
											// so we replace this with the _defaultVal
											var _new = angular.element(_defaultVal);
											angular.element(selection).replaceWith(_new);
											taSelection.setSelectionToElementStart(_new[0]);
										}
									} else {
										// shift + Enter
										var tagName = selection.tagName.toLowerCase();
										//console.log('Shift+Enter', selection.tagName, attrs.taDefaultWrap, selection.innerHTML.trim());
										// For an LI: We see: LI p ....<br><br>
										// For a P: We see: P p ....<br><br>
										// on Safari, the browser ignores the Shift+Enter and acts just as an Enter Key
										// For an LI: We see: LI p <br>
										// For a P: We see: P p <br>
										if((tagName === attrs.taDefaultWrap ||
											tagName === 'li' ||
											tagName === 'pre' ||
											tagName === 'div') &&
											!/.+<br><br>/.test(selection.innerHTML.trim())) {
											var ps = selection.previousSibling;
											//console.log('wrong....', ps);
											// we need to remove this selection and fix the previousSibling up...
											if (ps) {
												ps.innerHTML = ps.innerHTML + '<br><br>';
												angular.element(selection).remove();
												taSelection.setSelectionToElementEnd(ps);
											}
										}
									}
								}
								var val = _compileHtml();
								if(_defaultVal !== '' && (val.trim() === '' || val.trim() === '<br>')){
									_setInnerHTML(_defaultVal);
									taSelection.setSelectionToElementStart(element.children()[0]);
								}else if(val.substring(0, 1) !== '<' && attrs.taDefaultWrap !== ''){
									/* we no longer do this, since there can be comments here and white space
									 var _savedSelection = rangy.saveSelection();
									 val = _compileHtml();
									 val = "<" + attrs.taDefaultWrap + ">" + val + "</" + attrs.taDefaultWrap + ">";
									 _setInnerHTML(val);
									 rangy.restoreSelection(_savedSelection);
									 */
								}
								var triggerUndo = _lastKey !== event.keyCode && UNDO_TRIGGER_KEYS.test(event.keyCode);
								if(_keyupTimeout) $timeout.cancel(_keyupTimeout);
								_keyupTimeout = $timeout(function() {
									_setViewValue(val, triggerUndo, true);
								}, ngModelOptions.$options.debounce || 400);
								if(!triggerUndo) _undoKeyupTimeout = $timeout(function(){ ngModel.$undoManager.push(val); }, 250);
								_lastKey = event.keyCode;
							}
						}
					});

					// when there is a change from a spelling correction in the browser, the only
					// change that is seen is a 'input' and the $watch('html') sees nothing... So
					// we added this element.on('input') to catch this change and call the _setViewValue()
					// so the ngModel is updated and all works as it should.
					var _inputTimeout;
					element.on('input', function() {
						if (_compileHtml() !== ngModel.$viewValue) {
							// we wait a time now to allow the natural $watch('html') to handle this change
							// and then after a 1 second delay, if there is still a difference we will do the
							// _setViewValue() call.
							/* istanbul ignore if: can't test */
							if(_inputTimeout) $timeout.cancel(_inputTimeout);
							/* istanbul ignore next: cant' test? */
							_inputTimeout = $timeout(function() {
								var _savedSelection = rangy.saveSelection();
								var _val = _compileHtml();
								if (_val !== ngModel.$viewValue) {
									//console.log('_setViewValue');
								    //console.log('old:', ngModel.$viewValue);
									//console.log('new:', _val);
									_setViewValue(_val, true);
								}
								rangy.restoreSelection(_savedSelection);
							}, 1000);
						}
					});

					element.on('blur', scope.events.blur = function(){
						_focussed = false;
						/* istanbul ignore else: if readonly don't update model */
						if(!_isReadonly){
							_setViewValue(undefined, undefined, true);
						}else{
							_skipRender = true; // don't redo the whole thing, just check the placeholder logic
							ngModel.$render();
						}
					});

					// Placeholders not supported on ie 8 and below
					if(attrs.placeholder && (_browserDetect.ie > 8 || _browserDetect.ie === undefined)){
						var rule;
						if(attrs.id) rule = addCSSRule('#' + attrs.id + '.placeholder-text:before', 'content: "' + attrs.placeholder + '"');
						else throw('textAngular Error: An unique ID is required for placeholders to work');

						scope.$on('$destroy', function(){
							removeCSSRule(rule);
						});
					}

					element.on('focus', scope.events.focus = function(){
						_focussed = true;
						element.removeClass('placeholder-text');
						_reApplyOnSelectorHandlers();
					});

					element.on('mouseup', scope.events.mouseup = function(){
						var _selection = taSelection.getSelection();
						if(_selection && _selection.start.element === element[0] && element.children().length) taSelection.setSelectionToElementStart(element.children()[0]);
					});

					// prevent propagation on mousedown in editor, see #206
					element.on('mousedown', scope.events.mousedown = function(event, eventData){
						/* istanbul ignore else: this is for catching the jqLite testing*/
						if(eventData) angular.extend(event, eventData);
						event.stopPropagation();
					});
				}
			}

			var fileDropHandler = function(event, eventData){
				/* istanbul ignore else: this is for catching the jqLite testing*/
				if(eventData) angular.extend(event, eventData);
				// emit the drop event, pass the element, preventing should be done elsewhere
				if(!dropFired && !_isReadonly){
					dropFired = true;
					var dataTransfer;
					if(event.originalEvent) dataTransfer = event.originalEvent.dataTransfer;
					else dataTransfer = event.dataTransfer;
					scope.$emit('ta-drop-event', this, event, dataTransfer);
					$timeout(function(){
						dropFired = false;
						_setViewValue(undefined, undefined, true);
					}, 100);
				}
			};

			var _renderTimeout;
			var _renderInProgress = false;
			// changes to the model variable from outside the html/text inputs
			ngModel.$render = function(){
				/* istanbul ignore if: Catches rogue renders, hard to replicate in tests */
				if(_renderInProgress) return;
				else _renderInProgress = true;
				// catch model being null or undefined
				var val = ngModel.$viewValue || '';
				// if the editor isn't focused it needs to be updated, otherwise it's receiving user input
				if(!_skipRender){
					/* istanbul ignore else: in other cases we don't care */
					if(_isContentEditable && _focussed){
						// update while focussed
						element.removeClass('placeholder-text');
 						/* istanbul ignore next: don't know how to test this */
						if(_renderTimeout) $timeout.cancel(_renderTimeout);
						_renderTimeout = $timeout(function(){
							/* istanbul ignore if: Can't be bothered testing this... */
							if(!_focussed){
								element[0].focus();
								taSelection.setSelectionToElementEnd(element.children()[element.children().length - 1]);
							}
							_renderTimeout = undefined;
						}, 1);
					}
					if(_isContentEditable){
						// WYSIWYG Mode
						if(attrs.placeholder){
							if(val === ''){
								// blank
								_setInnerHTML(_defaultVal);
							}else{
								// not-blank
								_setInnerHTML(val);
							}
						}else{
							_setInnerHTML((val === '') ? _defaultVal : val);
						}
						// if in WYSIWYG and readOnly we kill the use of links by clicking
						if(!_isReadonly){
							_reApplyOnSelectorHandlers();
							element.on('drop', fileDropHandler);
						}else{
							element.off('drop', fileDropHandler);
						}
					}else if(element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input'){
						// make sure the end user can SEE the html code as a display. This is a read-only display element
						_setInnerHTML(taApplyCustomRenderers(val));
					}else{
						// only for input and textarea inputs
						element.val(val);
					}
				}
				if(_isContentEditable && attrs.placeholder){
					if(val === ''){
						if(_focussed) element.removeClass('placeholder-text');
						else element.addClass('placeholder-text');
					}else{
						element.removeClass('placeholder-text');
					}
				}
				_renderInProgress = _skipRender = false;
			};

			if(attrs.taReadonly){
				//set initial value
				_isReadonly = scope.$eval(attrs.taReadonly);
				if(_isReadonly){
					element.addClass('ta-readonly');
					// we changed to readOnly mode (taReadonly='true')
					if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
						element.attr('disabled', 'disabled');
					}
					if(element.attr('contenteditable') !== undefined && element.attr('contenteditable')){
						element.removeAttr('contenteditable');
					}
				}else{
					element.removeClass('ta-readonly');
					// we changed to NOT readOnly mode (taReadonly='false')
					if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
						element.removeAttr('disabled');
					}else if(_isContentEditable){
						element.attr('contenteditable', 'true');
					}
				}
				// taReadonly only has an effect if the taBind element is an input or textarea or has contenteditable='true' on it.
				// Otherwise it is readonly by default
				scope.$watch(attrs.taReadonly, function(newVal, oldVal){
					if(oldVal === newVal) return;
					if(newVal){
						element.addClass('ta-readonly');
						// we changed to readOnly mode (taReadonly='true')
						if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
							element.attr('disabled', 'disabled');
						}
						if(element.attr('contenteditable') !== undefined && element.attr('contenteditable')){
							element.removeAttr('contenteditable');
						}
						// turn ON selector click handlers
						angular.forEach(taSelectableElements, function(selector){
							element.find(selector).on('click', selectorClickHandler);
						});
						element.off('drop', fileDropHandler);
					}else{
						element.removeClass('ta-readonly');
						// we changed to NOT readOnly mode (taReadonly='false')
						if(element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input'){
							element.removeAttr('disabled');
						}else if(_isContentEditable){
							element.attr('contenteditable', 'true');
						}
						// remove the selector click handlers
						angular.forEach(taSelectableElements, function(selector){
							element.find(selector).off('click', selectorClickHandler);
						});
						element.on('drop', fileDropHandler);
					}
					_isReadonly = newVal;
				});
			}

			// Initialise the selectableElements
			// if in WYSIWYG and readOnly we kill the use of links by clicking
			if(_isContentEditable && !_isReadonly){
				angular.forEach(taSelectableElements, function(selector){
					element.find(selector).on('click', selectorClickHandler);
				});
				element.on('drop', fileDropHandler);
			}
		}
	};
}]);
