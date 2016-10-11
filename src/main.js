// this global var is used to prevent multiple fires of the drop event. Needs to be global to the textAngular file.
var dropFired = false;
var textAngular = angular.module("textAngular", ['ngSanitize', 'textAngularSetup', 'textAngular.factories', 'textAngular.DOM', 'textAngular.validators', 'textAngular.taBind']); //This makes ngSanitize required

textAngular.config([function(){
	// clear taTools variable. Just catches testing and any other time that this config may run multiple times...
	angular.forEach(taTools, function(value, key){ delete taTools[key];	});
}]);

textAngular.directive("textAngular", [
	'$compile', '$timeout', 'taOptions', 'taSelection', 'taExecCommand',
	'textAngularManager', '$document', '$animate', '$log', '$q', '$parse',
	function($compile, $timeout, taOptions, taSelection, taExecCommand,
		textAngularManager, $document, $animate, $log, $q, $parse){
		return {
			require: '?ngModel',
			scope: {},
			restrict: "EA",
			priority: 2, // So we override validators correctly
			link: function(scope, element, attrs, ngModel){
				// all these vars should not be accessable outside this directive
				var _keydown, _keyup, _keypress, _mouseup, _focusin, _focusout,
					_originalContents, _editorFunctions,
					_serial = (attrs.serial) ? attrs.serial : Math.floor(Math.random() * 10000000000000000),
					_taExecCommand, _resizeMouseDown, _updateSelectedStylesTimeout;
				var _resizeTimeout;

				scope._name = (attrs.name) ? attrs.name : 'textAngularEditor' + _serial;

				var oneEvent = function(_element, event, action){
					$timeout(function(){
						_element.one(event, action);
					}, 100);
				};
				_taExecCommand = taExecCommand(attrs.taDefaultWrap);
				// get the settings from the defaults and add our specific functions that need to be on the scope
				angular.extend(scope, angular.copy(taOptions), {
					// wraps the selection in the provided tag / execCommand function. Should only be called in WYSIWYG mode.
					wrapSelection: function(command, opt, isSelectableElementTool){
						// we restore the saved selection that was saved when focus was lost
						/* NOT FUNCTIONAL YET */
						/* textAngularManager.restoreFocusSelection(scope._name, scope); */
						if(command.toLowerCase() === "undo"){
							scope['$undoTaBindtaTextElement' + _serial]();
						}else if(command.toLowerCase() === "redo"){
							scope['$redoTaBindtaTextElement' + _serial]();
						}else{
							// catch errors like FF erroring when you try to force an undo with nothing done
							_taExecCommand(command, false, opt, scope.defaultTagAttributes);
							if(isSelectableElementTool){
								// re-apply the selectable tool events
								scope['reApplyOnSelectorHandlerstaTextElement' + _serial]();
							}
							// refocus on the shown display element, this fixes a display bug when using :focus styles to outline the box.
							// You still have focus on the text/html input it just doesn't show up
							scope.displayElements.text[0].focus();
						}
					},
					showHtml: scope.$eval(attrs.taShowHtml) || false
				});
				// setup the options from the optional attributes
				if(attrs.taFocussedClass)			scope.classes.focussed = attrs.taFocussedClass;
				if(attrs.taTextEditorClass)			scope.classes.textEditor = attrs.taTextEditorClass;
				if(attrs.taHtmlEditorClass)			scope.classes.htmlEditor = attrs.taHtmlEditorClass;
				if(attrs.taDefaultTagAttributes){
					try	{
						//	TODO: This should use angular.merge to enhance functionality once angular 1.4 is required
						angular.extend(scope.defaultTagAttributes, angular.fromJson(attrs.taDefaultTagAttributes));
					} catch (error) {
						$log.error(error);
					}
				}
				// optional setup functions
				if(attrs.taTextEditorSetup)			scope.setup.textEditorSetup = scope.$parent.$eval(attrs.taTextEditorSetup);
				if(attrs.taHtmlEditorSetup)			scope.setup.htmlEditorSetup = scope.$parent.$eval(attrs.taHtmlEditorSetup);
				// optional fileDropHandler function
				if(attrs.taFileDrop)				scope.fileDropHandler = scope.$parent.$eval(attrs.taFileDrop);
				else								scope.fileDropHandler = scope.defaultFileDropHandler;

				_originalContents = element[0].innerHTML;
				// clear the original content
				element[0].innerHTML = '';

				// Setup the HTML elements as variable references for use later
				scope.displayElements = {
					// we still need the hidden input even with a textarea as the textarea may have invalid/old input in it,
					// wheras the input will ALLWAYS have the correct value.
					forminput: angular.element("<input type='hidden' tabindex='-1' style='display: none;'>"),
					html: angular.element("<textarea></textarea>"),
					text: angular.element("<div></div>"),
					// other toolbased elements
					scrollWindow: angular.element("<div class='ta-scroll-window'></div>"),
					popover: angular.element('<div class="popover fade bottom" style="max-width: none; width: 305px;"></div>'),
					popoverArrow: angular.element('<div class="arrow"></div>'),
					popoverContainer: angular.element('<div class="popover-content"></div>'),
					resize: {
						overlay: angular.element('<div class="ta-resizer-handle-overlay"></div>'),
						background: angular.element('<div class="ta-resizer-handle-background"></div>'),
						anchors: [
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-tl"></div>'),
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-tr"></div>'),
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-bl"></div>'),
							angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-br"></div>')
						],
						info: angular.element('<div class="ta-resizer-handle-info"></div>')
					}
				};

				// Setup the popover
				scope.displayElements.popover.append(scope.displayElements.popoverArrow);
				scope.displayElements.popover.append(scope.displayElements.popoverContainer);
				scope.displayElements.scrollWindow.append(scope.displayElements.popover);

				scope.displayElements.popover.on('mousedown', function(e, eventData){
					/* istanbul ignore else: this is for catching the jqLite testing*/
					if(eventData) angular.extend(e, eventData);
					// this prevents focusout from firing on the editor when clicking anything in the popover
					e.preventDefault();
					return false;
				});

				/* istanbul ignore next: popover resize and scroll events handled */
				scope.handlePopoverEvents = function() {
					if (scope.displayElements.popover.css('display')==='block') {
						if(_resizeTimeout) $timeout.cancel(_resizeTimeout);
						_resizeTimeout = $timeout(function() {
							//console.log('resize', scope.displayElements.popover.css('display'));
							scope.reflowPopover(scope.resizeElement);
							scope.reflowResizeOverlay(scope.resizeElement);
						}, 100);
					}
				};

				/* istanbul ignore next: browser resize check */
				angular.element(window).on('resize', scope.handlePopoverEvents);

				/* istanbul ignore next: browser scroll check */
				angular.element(window).on('scroll', scope.handlePopoverEvents);

				// we want to know if a given node has a scrollbar!
				// credit to lotif on http://stackoverflow.com/questions/4880381/check-whether-html-element-has-scrollbars
				var isScrollable = function(node) {
					var cs;
					var _notScrollable = {
						vertical: false,
						horizontal: false,
					};
					try {
						cs = window.getComputedStyle(node);
						if (cs === null) {
							return _notScrollable;
						}
					} catch (e) {
						/* istanbul ignore next: error handler */
						return _notScrollable;
					}
					var overflowY = cs['overflow-y'];
					var overflowX = cs['overflow-x'];
					return {
						vertical: (overflowY === 'scroll' || overflowY === 'auto') &&
									/* istanbul ignore next: not tested */
									node.scrollHeight > node.clientHeight,
						horizontal: (overflowX === 'scroll' || overflowX === 'auto') &&
									/* istanbul ignore next: not tested */
						    		node.scrollWidth > node.clientWidth,
					};
				};

				// getScrollTop
				//
				// we structure this so that it can climb the parents of the _el and when it finds
				// one with scrollbars, it adds an EventListener, so that no matter how the
				// DOM is structured in the user APP, if there is a scrollbar not as part of the
				// ta-scroll-window, we will still capture the 'scroll' events...
				// and handle the scroll event properly and do the resize, etc.
				//
				scope.getScrollTop = function (_el, bAddListener) {
					var scrollTop = _el.scrollTop;
					if (typeof scrollTop === 'undefined') {
						scrollTop = 0;
					}
					/* istanbul ignore next: triggered only if has scrollbar */
					if (bAddListener && isScrollable(_el).vertical) {
						// remove element eventListener
						_el.removeEventListener('scroll', scope._scrollListener, false);
						_el.addEventListener('scroll', scope._scrollListener, false);
					}
					/* istanbul ignore next: triggered only if has scrollbar and scrolled */
					if (scrollTop !== 0) {
						return { node:_el.nodeName, top:scrollTop };
					}
					/* istanbul ignore else: catches only if no scroll */
					if (_el.parentNode) {
						return scope.getScrollTop(_el.parentNode, bAddListener);
					} else {
						return { node:'<none>', top:0 };
					}
				};

				// define the popover show and hide functions
				scope.showPopover = function(_el){
					scope.getScrollTop(scope.displayElements.scrollWindow[0], true);
					scope.displayElements.popover.css('display', 'block');
					// we must use a $timeout here, or the css change to the
					// displayElements.resize.overlay will not take!!!
					// WHY???
					$timeout(function() {
						scope.displayElements.resize.overlay.css('display', 'block');
					});
					scope.resizeElement = _el;
					scope.reflowPopover(_el);
					$animate.addClass(scope.displayElements.popover, 'in');
					oneEvent($document.find('body'), 'click keyup', function(){scope.hidePopover();});
				};

				/* istanbul ignore next: browser scroll event handler */
				scope._scrollListener = function (e, eventData){
					scope.handlePopoverEvents();
				};

				scope.reflowPopover = function(_el){
					var scrollTop = scope.getScrollTop(scope.displayElements.scrollWindow[0], false);
					var spaceAboveImage = _el[0].offsetTop-scrollTop.top;
					//var spaceBelowImage = scope.displayElements.text[0].offsetHeight - _el[0].offsetHeight - spaceAboveImage;
					//console.log(spaceAboveImage, spaceBelowImage);

					/* istanbul ignore if: catches only if near bottom of editor */
					if(spaceAboveImage < 51) {
						scope.displayElements.popover.css('top', _el[0].offsetTop + _el[0].offsetHeight + scope.displayElements.scrollWindow[0].scrollTop + 'px');
						scope.displayElements.popover.removeClass('top').addClass('bottom');
					} else {
						scope.displayElements.popover.css('top', _el[0].offsetTop - 54 + scope.displayElements.scrollWindow[0].scrollTop + 'px');
						scope.displayElements.popover.removeClass('bottom').addClass('top');
					}
					var _maxLeft = scope.displayElements.text[0].offsetWidth - scope.displayElements.popover[0].offsetWidth;
					var _targetLeft = _el[0].offsetLeft + (_el[0].offsetWidth / 2.0) - (scope.displayElements.popover[0].offsetWidth / 2.0);
					var _rleft = Math.max(0, Math.min(_maxLeft, _targetLeft));
					var _marginLeft = (Math.min(_targetLeft, (Math.max(0, _targetLeft - _maxLeft))) - 11);
					_rleft += window.scrollX;
					_marginLeft -= window.scrollX;
					scope.displayElements.popover.css('left', _rleft + 'px');
					scope.displayElements.popoverArrow.css('margin-left', _marginLeft + 'px');
				};
				scope.hidePopover = function(){
					scope.displayElements.popover.css('display', 'none');
					scope.displayElements.popoverContainer.attr('style', '');
					scope.displayElements.popoverContainer.attr('class', 'popover-content');
					scope.displayElements.popover.removeClass('in');
					scope.displayElements.resize.overlay.css('display', 'none');
				};

				// setup the resize overlay
				scope.displayElements.resize.overlay.append(scope.displayElements.resize.background);
				angular.forEach(scope.displayElements.resize.anchors, function(anchor){ scope.displayElements.resize.overlay.append(anchor);});
				scope.displayElements.resize.overlay.append(scope.displayElements.resize.info);
				scope.displayElements.scrollWindow.append(scope.displayElements.resize.overlay);

				// A click event on the resize.background will now shift the focus to the editor
				/* istanbul ignore next: click on the resize.background to focus back to editor */
				scope.displayElements.resize.background.on('click', function(e) {
					scope.displayElements.text[0].focus();
				});

				// define the show and hide events
				scope.reflowResizeOverlay = function(_el){
					_el = angular.element(_el)[0];
					scope.displayElements.resize.overlay.css({
						'display': 'block',
						'left': _el.offsetLeft - 5 + 'px',
						'top': _el.offsetTop - 5 + 'px',
						'width': _el.offsetWidth + 10 + 'px',
						'height': _el.offsetHeight + 10 + 'px'
					});
					scope.displayElements.resize.info.text(_el.offsetWidth + ' x ' + _el.offsetHeight);
				};
				/* istanbul ignore next: pretty sure phantomjs won't test this */
				scope.showResizeOverlay = function(_el){
					var _body = $document.find('body');
					_resizeMouseDown = function(event){
						var startPosition = {
							width: parseInt(_el.attr('width')),
							height: parseInt(_el.attr('height')),
							x: event.clientX,
							y: event.clientY
						};
						if(startPosition.width === undefined || isNaN(startPosition.width)) startPosition.width = _el[0].offsetWidth;
						if(startPosition.height === undefined || isNaN(startPosition.height)) startPosition.height = _el[0].offsetHeight;
						scope.hidePopover();
						var ratio = startPosition.height / startPosition.width;
						var mousemove = function(event){
							// calculate new size
							var pos = {
								x: Math.max(0, startPosition.width + (event.clientX - startPosition.x)),
								y: Math.max(0, startPosition.height + (event.clientY - startPosition.y))
							};

							// DEFAULT: the aspect ratio is not locked unless the Shift key is pressed.
							//
							// attribute: ta-resize-force-aspect-ratio -- locks resize into maintaing the aspect ratio
							var bForceAspectRatio = (attrs.taResizeForceAspectRatio !== undefined);
							// attribute: ta-resize-maintain-aspect-ratio=true causes the space ratio to remain locked
							// unless the Shift key is pressed
							var bFlipKeyBinding = attrs.taResizeMaintainAspectRatio;
							var bKeepRatio =  bForceAspectRatio || (bFlipKeyBinding && !event.shiftKey);
							if(bKeepRatio) {
								var newRatio = pos.y / pos.x;
								pos.x = ratio > newRatio ? pos.x : pos.y / ratio;
								pos.y = ratio > newRatio ? pos.x * ratio : pos.y;
							}
							var el = angular.element(_el);
							function roundedMaxVal(val) {
								return Math.round(Math.max(0, val));
							}
							el.css('height', roundedMaxVal(pos.y) + 'px');
							el.css('width', roundedMaxVal(pos.x) + 'px');

							// reflow the popover tooltip
							scope.reflowResizeOverlay(_el);
						};
						_body.on('mousemove', mousemove);
						oneEvent(_body, 'mouseup', function(event){
							event.preventDefault();
							event.stopPropagation();
							_body.off('mousemove', mousemove);
							// at this point, we need to force the model to update! since the css has changed!
							// this fixes bug: #862 - we now hide the popover -- as this seems more consitent.
							// there are still issues under firefox, the window does not repaint. -- not sure
							// how best to resolve this, but clicking anywhere works.
							scope.$apply(function (){
								scope.hidePopover();
								scope.updateTaBindtaTextElement();
							}, 100);
						});
						event.stopPropagation();
						event.preventDefault();
					};

					scope.displayElements.resize.anchors[3].off('mousedown');
					scope.displayElements.resize.anchors[3].on('mousedown', _resizeMouseDown);

					scope.reflowResizeOverlay(_el);
					oneEvent(_body, 'click', function(){scope.hideResizeOverlay();});
				};
				/* istanbul ignore next: pretty sure phantomjs won't test this */
				scope.hideResizeOverlay = function(){
					scope.displayElements.resize.anchors[3].off('mousedown', _resizeMouseDown);
					scope.displayElements.resize.overlay.css('display', 'none');
				};

				// allow for insertion of custom directives on the textarea and div
				scope.setup.htmlEditorSetup(scope.displayElements.html);
				scope.setup.textEditorSetup(scope.displayElements.text);
				scope.displayElements.html.attr({
					'id': 'taHtmlElement' + _serial,
					'ng-show': 'showHtml',
					'ta-bind': 'ta-bind',
					'ng-model': 'html',
					'ng-model-options': element.attr('ng-model-options')
				});
				scope.displayElements.text.attr({
					'id': 'taTextElement' + _serial,
					'contentEditable': 'true',
					'ta-bind': 'ta-bind',
					'ng-model': 'html',
					'ng-model-options': element.attr('ng-model-options')
				});
				scope.displayElements.scrollWindow.attr({'ng-hide': 'showHtml'});
				if(attrs.taDefaultWrap) {
					// taDefaultWrap is only applied to the text and not the html view
					scope.displayElements.text.attr('ta-default-wrap', attrs.taDefaultWrap);
				}

				if(attrs.taUnsafeSanitizer){
					scope.displayElements.text.attr('ta-unsafe-sanitizer', attrs.taUnsafeSanitizer);
					scope.displayElements.html.attr('ta-unsafe-sanitizer', attrs.taUnsafeSanitizer);
				}

				// add the main elements to the origional element
				scope.displayElements.scrollWindow.append(scope.displayElements.text);
				element.append(scope.displayElements.scrollWindow);
				element.append(scope.displayElements.html);

				scope.displayElements.forminput.attr('name', scope._name);
				element.append(scope.displayElements.forminput);

				if(attrs.tabindex){
					element.removeAttr('tabindex');
					scope.displayElements.text.attr('tabindex', attrs.tabindex);
					scope.displayElements.html.attr('tabindex', attrs.tabindex);
				}

				if (attrs.placeholder) {
					scope.displayElements.text.attr('placeholder', attrs.placeholder);
					scope.displayElements.html.attr('placeholder', attrs.placeholder);
				}

				if(attrs.taDisabled){
					scope.displayElements.text.attr('ta-readonly', 'disabled');
					scope.displayElements.html.attr('ta-readonly', 'disabled');
					scope.disabled = scope.$parent.$eval(attrs.taDisabled);
					scope.$parent.$watch(attrs.taDisabled, function(newVal){
						scope.disabled = newVal;
						if(scope.disabled){
							element.addClass(scope.classes.disabled);
						}else{
							element.removeClass(scope.classes.disabled);
						}
					});
				}

				if(attrs.taPaste){
					scope._pasteHandler = function(_html){
						return $parse(attrs.taPaste)(scope.$parent, {$html: _html});
					};
					scope.displayElements.text.attr('ta-paste', '_pasteHandler($html)');
				}

				// compile the scope with the text and html elements only - if we do this with the main element it causes a compile loop
				$compile(scope.displayElements.scrollWindow)(scope);
				$compile(scope.displayElements.html)(scope);

				scope.updateTaBindtaTextElement = scope['updateTaBindtaTextElement' + _serial];
				scope.updateTaBindtaHtmlElement = scope['updateTaBindtaHtmlElement' + _serial];

				// add the classes manually last
				element.addClass("ta-root");
				scope.displayElements.scrollWindow.addClass("ta-text ta-editor " + scope.classes.textEditor);
				scope.displayElements.html.addClass("ta-html ta-editor " + scope.classes.htmlEditor);

				var testAndSet = function(choice, beforeState) {
					/* istanbul ignore next: this is only here because of a bug in rangy where rangy.saveSelection() has cleared the state */
					if (beforeState !== $document[0].queryCommandState(choice)) {
						$document[0].execCommand(choice, false, null);
					}
				};
				// used in the toolbar actions
				scope._actionRunning = false;
				var _savedSelection = false;
				scope.startAction = function(){
					var _beforeStateBold = false;
					var _beforeStateItalic = false;
					var _beforeStateUnderline = false;
					var _beforeStateStrikethough = false;
					scope._actionRunning = true;
					_beforeStateBold = $document[0].queryCommandState('bold');
					_beforeStateItalic = $document[0].queryCommandState('italic');
					_beforeStateUnderline = $document[0].queryCommandState('underline');
					_beforeStateStrikethough = $document[0].queryCommandState('strikeThrough');
					//console.log('B', _beforeStateBold, 'I', _beforeStateItalic, '_', _beforeStateUnderline, 'S', _beforeStateStrikethough);
					// if rangy library is loaded return a function to reload the current selection
					_savedSelection = rangy.saveSelection();
					// rangy.saveSelection() clear the state of bold, italic, underline, strikethrough
					// so we reset them here....!!!
					// this fixes bugs #423, #1129, #1105, #693 which are actually rangy bugs!
					testAndSet('bold', _beforeStateBold);
					testAndSet('italic', _beforeStateItalic);
					testAndSet('underline', _beforeStateUnderline);
					testAndSet('strikeThrough', _beforeStateStrikethough);
					//console.log('B', $document[0].queryCommandState('bold'), 'I', $document[0].queryCommandState('italic'), '_', $document[0].queryCommandState('underline'), 'S', $document[0].queryCommandState('strikeThrough') );
					return function(){
						if(_savedSelection) rangy.restoreSelection(_savedSelection);
						// perhaps if we restore the selections here, we would do better overall???
						// BUT what we do above does well in 90% of the cases...
					};
				};
				scope.endAction = function(){
					scope._actionRunning = false;
					if(_savedSelection){
						if(scope.showHtml){
							scope.displayElements.html[0].focus();
						}else{
							scope.displayElements.text[0].focus();
						}
						// rangy.restoreSelection(_savedSelection);
						rangy.removeMarkers(_savedSelection);
					}
					_savedSelection = false;
					scope.updateSelectedStyles();
					// only update if in text or WYSIWYG mode
					if(!scope.showHtml) scope['updateTaBindtaTextElement' + _serial]();
				};

				// note that focusout > focusin is called everytime we click a button - except bad support: http://www.quirksmode.org/dom/events/blurfocus.html
				// cascades to displayElements.text and displayElements.html automatically.
				_focusin = function(e){
					scope.focussed = true;
					element.addClass(scope.classes.focussed);
/*******  NOT FUNCTIONAL YET
					if (e.target.id === 'taTextElement' + _serial) {
						console.log('_focusin taTextElement');
						// we only do this if NOT focussed
						textAngularManager.restoreFocusSelection(scope._name);
					}
*******/
					_editorFunctions.focus();
					element.triggerHandler('focus');
					// we call editorScope.updateSelectedStyles() here because we want the toolbar to be focussed
					// as soon as we have focus.  Otherwise this only happens on mousedown or keydown etc...
					/* istanbul ignore else: don't run if already running */
					if(scope.updateSelectedStyles && !scope._bUpdateSelectedStyles){
						// we don't set editorScope._bUpdateSelectedStyles here, because we do not want the
						// updateSelectedStyles() to run twice which it will do after 200 msec if we have
						// set editorScope._bUpdateSelectedStyles
						//
						// WOW, normally I would do a scope.$apply here, but this causes ERRORs when doing tests!
						$timeout(function () {
							scope.updateSelectedStyles();
						}, 0);
					}
				};
				scope.displayElements.html.on('focus', _focusin);
				scope.displayElements.text.on('focus', _focusin);
				_focusout = function(e){
					/****************** NOT FUNCTIONAL YET
					try {
						var _s = rangy.getSelection();
						if (_s) {
							// we save the selection when we loose focus so that if do a wrapSelection, the
							// apropriate selection in the editor is restored before action.
							var _savedFocusRange = rangy.saveRange(_s.getRangeAt(0));
							textAngularManager.saveFocusSelection(scope._name, _savedFocusRange);
						}
					} catch(error) { }
					*****************/
					// if we are NOT runnig an action and have NOT focussed again on the text etc then fire the blur events
					if(!scope._actionRunning &&
						$document[0].activeElement !== scope.displayElements.html[0] &&
						$document[0].activeElement !== scope.displayElements.text[0])
					{
						element.removeClass(scope.classes.focussed);
						_editorFunctions.unfocus();
						// to prevent multiple apply error defer to next seems to work.
						$timeout(function(){
							scope._bUpdateSelectedStyles = false;
							element.triggerHandler('blur');
							scope.focussed = false;
						}, 0);
					}
					e.preventDefault();
					return false;
				};
				scope.displayElements.html.on('blur', _focusout);
				scope.displayElements.text.on('blur', _focusout);

				scope.displayElements.text.on('paste', function(event){
					element.triggerHandler('paste', event);
				});

				// Setup the default toolbar tools, this way allows the user to add new tools like plugins.
				// This is on the editor for future proofing if we find a better way to do this.
				scope.queryFormatBlockState = function(command){
					// $document[0].queryCommandValue('formatBlock') errors in Firefox if we call this when focussed on the textarea
					return !scope.showHtml && command.toLowerCase() === $document[0].queryCommandValue('formatBlock').toLowerCase();
				};
				scope.queryCommandState = function(command){
					// $document[0].queryCommandValue('formatBlock') errors in Firefox if we call this when focussed on the textarea
					return (!scope.showHtml) ? $document[0].queryCommandState(command) : '';
				};
				scope.switchView = function(){
					scope.showHtml = !scope.showHtml;
					$animate.enabled(false, scope.displayElements.html);
					$animate.enabled(false, scope.displayElements.text);
					//Show the HTML view
					/* istanbul ignore next: ngModel exists check */
/* THIS is not the correct thing to do, here....
   The ngModel is correct, but it is not formatted as the user as done it...
					var _model;
					if (ngModel) {
						_model = ngModel.$viewValue;
					} else {
						_model = scope.html;
					}
					var _html = scope.displayElements.html[0].value;
					if (getDomFromHtml(_html).childElementCount !== getDomFromHtml(_model).childElementCount) {
						// the model and the html do not agree
						// they can get out of sync and when they do, we correct that here...
						scope.displayElements.html.val(_model);
					}
*/
					if(scope.showHtml){
						//defer until the element is visible
						$timeout(function(){
							$animate.enabled(true, scope.displayElements.html);
							$animate.enabled(true, scope.displayElements.text);
							// [0] dereferences the DOM object from the angular.element
							return scope.displayElements.html[0].focus();
						}, 100);
					}else{
						//Show the WYSIWYG view
						//defer until the element is visible
						$timeout(function(){
							$animate.enabled(true, scope.displayElements.html);
							$animate.enabled(true, scope.displayElements.text);
							// [0] dereferences the DOM object from the angular.element
							return scope.displayElements.text[0].focus();
						}, 100);
					}
				};

				// changes to the model variable from outside the html/text inputs
				// if no ngModel, then the only input is from inside text-angular
				if(attrs.ngModel){
					var _firstRun = true;
					ngModel.$render = function(){
						if(_firstRun){
							// we need this firstRun to set the originalContents otherwise it gets overrided by the setting of ngModel to undefined from NaN
							_firstRun = false;
							// if view value is null or undefined initially and there was original content, set to the original content
							var _initialValue = scope.$parent.$eval(attrs.ngModel);
							if((_initialValue === undefined || _initialValue === null) && (_originalContents && _originalContents !== '')){
								// on passing through to taBind it will be sanitised
								ngModel.$setViewValue(_originalContents);
							}
						}
						scope.displayElements.forminput.val(ngModel.$viewValue);
						// if the editors aren't focused they need to be updated, otherwise they are doing the updating
						scope.html = ngModel.$viewValue || '';
					};
					// trigger the validation calls
					if(element.attr('required')) ngModel.$validators.required = function(modelValue, viewValue) {
						var value = modelValue || viewValue;
						return !(!value || value.trim() === '');
					};
				}else{
					// if no ngModel then update from the contents of the origional html.
					scope.displayElements.forminput.val(_originalContents);
					scope.html = _originalContents;
				}

				// changes from taBind back up to here
				scope.$watch('html', function(newValue, oldValue){
					if(newValue !== oldValue){
						if(attrs.ngModel && ngModel.$viewValue !== newValue) {
							ngModel.$setViewValue(newValue);
						}
						scope.displayElements.forminput.val(newValue);
					}
				});

				if(attrs.taTargetToolbars) {
					_editorFunctions = textAngularManager.registerEditor(scope._name, scope, attrs.taTargetToolbars.split(','));
				}
				else{
					var _toolbar = angular.element('<div text-angular-toolbar name="textAngularToolbar' + _serial + '">');
					// passthrough init of toolbar options
					if(attrs.taToolbar)						_toolbar.attr('ta-toolbar', attrs.taToolbar);
					if(attrs.taToolbarClass)				_toolbar.attr('ta-toolbar-class', attrs.taToolbarClass);
					if(attrs.taToolbarGroupClass)			_toolbar.attr('ta-toolbar-group-class', attrs.taToolbarGroupClass);
					if(attrs.taToolbarButtonClass)			_toolbar.attr('ta-toolbar-button-class', attrs.taToolbarButtonClass);
					if(attrs.taToolbarActiveButtonClass)	_toolbar.attr('ta-toolbar-active-button-class', attrs.taToolbarActiveButtonClass);
					if(attrs.taFocussedClass)				_toolbar.attr('ta-focussed-class', attrs.taFocussedClass);

					element.prepend(_toolbar);
					$compile(_toolbar)(scope.$parent);
					_editorFunctions = textAngularManager.registerEditor(scope._name, scope, ['textAngularToolbar' + _serial]);
				}

				scope.$on('$destroy', function(){
					textAngularManager.unregisterEditor(scope._name);
					angular.element(window).off('blur');
					angular.element(window).off('resize', scope.handlePopoverEvents);
					angular.element(window).off('scroll', scope.handlePopoverEvents);
				});

				// catch element select event and pass to toolbar tools
				scope.$on('ta-element-select', function(event, element){
					if(_editorFunctions.triggerElementSelect(event, element)){
						scope['reApplyOnSelectorHandlerstaTextElement' + _serial]();
					}
				});

/******************* no working fully
				var distanceFromPoint = function (px, py, x, y) {
					return Math.sqrt((px-x)*(px-x)+(py-y)*(py-y));
				};
				// because each object is a rectangle and we have a single point,
				// we need to give priority if the point is inside the rectangle
				var getPositionDistance = function(el, x, y) {
					var range = document.createRange();
					range.selectNode(el);
					var rect = range.getBoundingClientRect();
					console.log(el, rect);
					range.detach();
					var bcr = rect;
					// top left
					var d1 = distanceFromPoint(bcr.left, bcr.top, x, y);
					// bottom left
					var d2 = distanceFromPoint(bcr.left, bcr.bottom, x, y);
					// top right
					var d3 = distanceFromPoint(bcr.right, bcr.top, x, y);
					// bottom right
					var d4 = distanceFromPoint(bcr.right, bcr.bottom, x, y);
					return Math.min(d1, d2, d3, d4);
				};
				var findClosest = function(el, minElement, maxDistance, x, y) {
					var _d=0;
					for (var i = 0; i < el.childNodes.length; i++) {
						var _n = el.childNodes[i];
						if (!_n.childNodes.length) {
							_d = getPositionDistance(_n, x, y);
							//console.log(_n, _n.childNodes, _d);
							if (_d < maxDistance) {
								maxDistance = _d;
								minElement = _n;
							}
						}
						var res = findClosest(_n, minElement, maxDistance, x, y);
						if (res.max < maxDistance) {
							maxDistance = res.max;
							minElement = res.min;
						}
					}
					return { max: maxDistance, min: minElement };
				};
				var getClosestElement = function (el, x, y) {
					return findClosest(el, null, 12341234124, x, y);
				};
****************/

				scope.$on('ta-drop-event', function(event, element, dropEvent, dataTransfer){
					if(dataTransfer && dataTransfer.files && dataTransfer.files.length > 0){
						scope.displayElements.text[0].focus();
						// we must set the location of the drop!
						//console.log(dropEvent.clientX, dropEvent.clientY, dropEvent.target);
						taSelection.setSelectionToElementEnd(dropEvent.target);
						angular.forEach(dataTransfer.files, function(file){
							// taking advantage of boolean execution, if the fileDropHandler returns true, nothing else after it is executed
							// If it is false then execute the defaultFileDropHandler if the fileDropHandler is NOT the default one
							// Once one of these has been executed wrap the result as a promise, if undefined or variable update the taBind, else we should wait for the promise
							try{
								$q.when(scope.fileDropHandler(file, scope.wrapSelection) ||
									(scope.fileDropHandler !== scope.defaultFileDropHandler &&
									$q.when(scope.defaultFileDropHandler(file, scope.wrapSelection)))).then(function(){
										scope['updateTaBindtaTextElement' + _serial]();
									});
							}catch(error){
								$log.error(error);
							}
						});
						dropEvent.preventDefault();
						dropEvent.stopPropagation();
					/* istanbul ignore else, the updates if moved text */
					}else{
						$timeout(function(){
							scope['updateTaBindtaTextElement' + _serial]();
						}, 0);
					}
				});

				// the following is for applying the active states to the tools that support it
				scope._bUpdateSelectedStyles = false;
				/* istanbul ignore next: browser window/tab leave check */
				angular.element(window).on('blur', function(){
					scope._bUpdateSelectedStyles = false;
					scope.focussed = false;
				});
				// loop through all the tools polling their activeState function if it exists
				scope.updateSelectedStyles = function(){
					var _selection;
					/* istanbul ignore next: This check is to ensure multiple timeouts don't exist */
					if(_updateSelectedStylesTimeout) $timeout.cancel(_updateSelectedStylesTimeout);
					// test if the common element ISN'T the root ta-text node
					if((_selection = taSelection.getSelectionElement()) !== undefined && _selection.parentNode !== scope.displayElements.text[0]){
						_editorFunctions.updateSelectedStyles(angular.element(_selection));
					}else _editorFunctions.updateSelectedStyles();
					// used to update the active state when a key is held down, ie the left arrow
					/* istanbul ignore else: browser only check */
					if(scope._bUpdateSelectedStyles) _updateSelectedStylesTimeout = $timeout(scope.updateSelectedStyles, 200);
				};
				// start updating on keydown
				_keydown = function(){
					/* istanbul ignore next: ie catch */
					if(!scope.focussed){
						scope._bUpdateSelectedStyles = false;
						return;
					}
					/* istanbul ignore else: don't run if already running */
					if(!scope._bUpdateSelectedStyles){
						scope._bUpdateSelectedStyles = true;
						scope.$apply(function(){
							scope.updateSelectedStyles();
						});
					}
				};
				scope.displayElements.html.on('keydown', _keydown);
				scope.displayElements.text.on('keydown', _keydown);
				// stop updating on key up and update the display/model
				_keyup = function(){
					scope._bUpdateSelectedStyles = false;
				};
				scope.displayElements.html.on('keyup', _keyup);
				scope.displayElements.text.on('keyup', _keyup);
				// stop updating on key up and update the display/model
				_keypress = function(event, eventData){
					// bug fix for Firefox.  If we are selecting a <a> already, any characters will
					// be added within the <a> which is bad!
					/* istanbul ignore next: don't see how to test this... */
					if (taSelection.getSelection) {
						var _selection = taSelection.getSelection();
						// in a weird case (can't reproduce) taSelection.getSelectionElement() can be undefined!!
						// this comes from range.commonAncestorContainer;
						// so I check for this here which fixes the error case
						if (taSelection.getSelectionElement() && taSelection.getSelectionElement().nodeName.toLowerCase() === 'a') {
							// check and see if we are at the edge of the <a>
							if (_selection.start.element.nodeType === 3 &&
								_selection.start.element.textContent.length === _selection.end.offset) {
								// we are at the end of the <a>!!!
								// so move the selection to after the <a>!!
								taSelection.setSelectionAfterElement(taSelection.getSelectionElement());
							}
							if (_selection.start.element.nodeType === 3 &&
								_selection.start.offset === 0) {
								// we are at the start of the <a>!!!
								// so move the selection before the <a>!!
								taSelection.setSelectionBeforeElement(taSelection.getSelectionElement());
							}
						}
					}
					/* istanbul ignore else: this is for catching the jqLite testing*/
					if(eventData) angular.extend(event, eventData);
					scope.$apply(function(){
						if(_editorFunctions.sendKeyCommand(event)){
							/* istanbul ignore else: don't run if already running */
							if(!scope._bUpdateSelectedStyles){
								scope.updateSelectedStyles();
							}
							event.preventDefault();
							return false;
						}
					});
				};
				scope.displayElements.html.on('keypress', _keypress);
				scope.displayElements.text.on('keypress', _keypress);
				// update the toolbar active states when we click somewhere in the text/html boxed
				_mouseup = function(){
					// ensure only one execution of updateSelectedStyles()
					scope._bUpdateSelectedStyles = false;
					// for some reason, unless we do a $timeout here, after a _mouseup when the line is
					// highlighted, and instead use a scope.$apply(function(){ scope.updateSelectedStyles(); });
					// doesn't work properly, so we replaced this with:
					/* istanbul ignore next: not tested  */
					$timeout(function() { scope.updateSelectedStyles(); }, 0);
				};
				scope.displayElements.html.on('mouseup', _mouseup);
				scope.displayElements.text.on('mouseup', _mouseup);
			}
		};
	}
]);
textAngular.service('textAngularManager', ['taToolExecuteAction', 'taTools', 'taRegisterTool', '$interval', '$rootScope', '$log',
	function(taToolExecuteAction, taTools, taRegisterTool, $interval, $rootScope, $log){
	// this service is used to manage all textAngular editors and toolbars.
	// All publicly published functions that modify/need to access the toolbar or editor scopes should be in here
	// these contain references to all the editors and toolbars that have been initialised in this app
	var toolbars = {}, editors = {};
	// we touch the time any change occurs through register of an editor or tool so that we
	// in the future will fire and event to trigger an updateSelection
	var timeRecentModification = 0;
	var updateStyles = function(selectedElement){
		angular.forEach(editors, function(editor) {
			editor.editorFunctions.updateSelectedStyles(selectedElement);
		});
	};
	var triggerInterval = 50;
	var triggerIntervalTimer;
	var setupTriggerUpdateStyles = function() {
		timeRecentModification = Date.now();
		/* istanbul ignore next: setup a one time updateStyles() */
		triggerIntervalTimer = $interval(function() {
			updateStyles();
			triggerIntervalTimer = undefined;
		}, triggerInterval, 1); // only trigger once
	};
	/* istanbul ignore next: make sure clean up on destroy */
	$rootScope.$on('destroy', function() {
		if (triggerIntervalTimer) {
			$interval.cancel(triggerIntervalTimer);
			triggerIntervalTimer = undefined;
		}
	});
	var touchModification = function() {
		if (Math.abs(Date.now() - timeRecentModification) > triggerInterval) {
			// we have already triggered the updateStyles a long time back... so setup it again...
			setupTriggerUpdateStyles();
		}
	};
	// when we focus into a toolbar, we need to set the TOOLBAR's $parent to be the toolbars it's linked to.
	// We also need to set the tools to be updated to be the toolbars...
	return {
		// register an editor and the toolbars that it is affected by
		registerEditor: function(editorName, editorScope, targetToolbars){
			// NOTE: name === editorScope._name
			// targetToolbars is an [] of 'toolbar name's
			// targetToolbars are optional, we don't require a toolbar to function
			if(!editorName || editorName === '') throw('textAngular Error: An editor requires a name');
			if(!editorScope) throw('textAngular Error: An editor requires a scope');
			if(editors[editorName]) throw('textAngular Error: An Editor with name "' + editorName + '" already exists');
			editors[editorName] = {
				scope: editorScope,
				toolbars: targetToolbars,
				// toolbarScopes used by this editor
				toolbarScopes: [],
				_registerToolbarScope: function(toolbarScope){
					// add to the list late
					if(this.toolbars.indexOf(toolbarScope.name) >= 0) {
						// if this toolbarScope is being used by this editor we add it as one of the scopes
						this.toolbarScopes.push(toolbarScope);
					}
				},
				// this is a suite of functions the editor should use to update all it's linked toolbars
				editorFunctions: {
					disable: function(){
						// disable all linked toolbars
						angular.forEach(editors[editorName].toolbarScopes, function(toolbarScope){
							toolbarScope.disabled = true;
						});
					},
					enable: function(){
						// enable all linked toolbars
						angular.forEach(editors[editorName].toolbarScopes, function(toolbarScope){
							toolbarScope.disabled = false;
						});
					},
					focus: function(){
						// this should be called when the editor is focussed
						angular.forEach(editors[editorName].toolbarScopes, function(toolbarScope){
							toolbarScope._parent = editorScope;
							toolbarScope.disabled = false;
							toolbarScope.focussed = true;
						});
						editorScope.focussed = true;
					},
					unfocus: function(){
						// this should be called when the editor becomes unfocussed
						angular.forEach(editors[editorName].toolbarScopes, function(toolbarScope){
							toolbarScope.disabled = true;
							toolbarScope.focussed = false;
						});
						editorScope.focussed = false;
					},
					updateSelectedStyles: function(selectedElement){
						// update the active state of all buttons on liked toolbars
						angular.forEach(editors[editorName].toolbarScopes, function(toolbarScope){
							angular.forEach(toolbarScope.tools, function(toolScope){
								if(toolScope.activeState){
									toolbarScope._parent = editorScope;
									// selectedElement may be undefined if nothing selected
									toolScope.active = toolScope.activeState(selectedElement);
								}
							});
						});
					},
					sendKeyCommand: function(event){
						// we return true if we applied an action, false otherwise
						var result = false;
						if(event.ctrlKey || event.metaKey || event.specialKey) angular.forEach(taTools, function(tool, name){
							if(tool.commandKeyCode && (tool.commandKeyCode === event.which || tool.commandKeyCode === event.specialKey)){
								for(var _t = 0; _t < editors[editorName].toolbarScopes.length; _t++){
									if(editors[editorName].toolbarScopes[_t].tools[name] !== undefined){
										taToolExecuteAction.call(editors[editorName].toolbarScopes[_t].tools[name], editorScope);
										result = true;
										break;
									}
								}
							}
						});
						return result;
					},
					triggerElementSelect: function(event, element){
						// search through the taTools to see if a match for the tag is made.
						// if there is, see if the tool is on a registered toolbar and not disabled.
						// NOTE: This can trigger on MULTIPLE tools simultaneously.
						var elementHasAttrs = function(_element, attrs){
							var result = true;
							for(var i = 0; i < attrs.length; i++) result = result && _element.attr(attrs[i]);
							return result;
						};
						var workerTools = [];
						var unfilteredTools = {};
						var result = false;
						element = angular.element(element);
						// get all valid tools by element name, keep track if one matches the
						var onlyWithAttrsFilter = false;
						angular.forEach(taTools, function(tool, name){
							if(
								tool.onElementSelect &&
								tool.onElementSelect.element &&
								tool.onElementSelect.element.toLowerCase() === element[0].tagName.toLowerCase() &&
								(!tool.onElementSelect.filter || tool.onElementSelect.filter(element))
							){
								// this should only end up true if the element matches the only attributes
								onlyWithAttrsFilter = onlyWithAttrsFilter ||
									(angular.isArray(tool.onElementSelect.onlyWithAttrs) && elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs));
								if(!tool.onElementSelect.onlyWithAttrs || elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs)) unfilteredTools[name] = tool;
							}
						});
						// if we matched attributes to filter on, then filter, else continue
						if(onlyWithAttrsFilter){
							angular.forEach(unfilteredTools, function(tool, name){
								if(tool.onElementSelect.onlyWithAttrs && elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs)) workerTools.push({'name': name, 'tool': tool});
							});
							// sort most specific (most attrs to find) first
							workerTools.sort(function(a,b){
								return b.tool.onElementSelect.onlyWithAttrs.length - a.tool.onElementSelect.onlyWithAttrs.length;
							});
						}else{
							angular.forEach(unfilteredTools, function(tool, name){
								workerTools.push({'name': name, 'tool': tool});
							});
						}
						// Run the actions on the first visible filtered tool only
						if(workerTools.length > 0){
							for(var _i = 0; _i < workerTools.length; _i++){
								var tool = workerTools[_i].tool;
								var name = workerTools[_i].name;
								for(var _t = 0; _t < editors[editorName].toolbarScopes.length; _t++){
									if(editors[editorName].toolbarScopes[_t].tools[name] !== undefined){
										tool.onElementSelect.action.call(editors[editorName].toolbarScopes[_t].tools[name], event, element, editorScope);
										result = true;
										break;
									}
								}
								if(result) break;
							}
						}
						return result;
					}
				}
			};
			angular.forEach(targetToolbars, function(_name){
				if(toolbars[_name]) {
					editors[editorName].toolbarScopes.push(toolbars[_name]);
				}
				// if it doesn't exist it may not have been compiled yet and it will be added later
			});
			touchModification();
			return editors[editorName].editorFunctions;
		},
		// retrieve editor by name, largely used by testing suites only
		retrieveEditor: function(name){
			return editors[name];
		},
		unregisterEditor: function(name){
			delete editors[name];
			touchModification();
		},
		// registers a toolbar such that it can be linked to editors
		registerToolbar: function(toolbarScope){
			if(!toolbarScope) throw('textAngular Error: A toolbar requires a scope');
			if(!toolbarScope.name || toolbarScope.name === '') throw('textAngular Error: A toolbar requires a name');
			if(toolbars[toolbarScope.name]) throw('textAngular Error: A toolbar with name "' + toolbarScope.name + '" already exists');
			toolbars[toolbarScope.name] = toolbarScope;
			// walk all the editors and connect this toolbarScope to the editors.... if we need to.  This way, it does
			// not matter if we register the editors after the toolbars or not
			// Note the editor will ignore this toolbarScope if it is not connected to it...
			angular.forEach(editors, function(_editor){
				_editor._registerToolbarScope(toolbarScope);
			});
			touchModification();
		},
		// retrieve toolbar by name, largely used by testing suites only
		retrieveToolbar: function(name){
			return toolbars[name];
		},
		// retrieve toolbars by editor name, largely used by testing suites only
		retrieveToolbarsViaEditor: function(name){
			var result = [], _this = this;
			angular.forEach(this.retrieveEditor(name).toolbars, function(name){
				result.push(_this.retrieveToolbar(name));
			});
			return result;
		},
		unregisterToolbar: function(name){
			delete toolbars[name];
			touchModification();
		},
		// functions for updating the toolbar buttons display
		updateToolsDisplay: function(newTaTools){
			// pass a partial struct of the taTools, this allows us to update the tools on the fly, will not change the defaults.
			var _this = this;
			angular.forEach(newTaTools, function(_newTool, key){
				_this.updateToolDisplay(key, _newTool);
			});
		},
		// this function resets all toolbars to their default tool definitions
		resetToolsDisplay: function(){
			var _this = this;
			angular.forEach(taTools, function(_newTool, key){
				_this.resetToolDisplay(key);
			});
			touchModification();
		},
		// update a tool on all toolbars
		updateToolDisplay: function(toolKey, _newTool){
			var _this = this;
			angular.forEach(toolbars, function(toolbarScope, toolbarKey){
				_this.updateToolbarToolDisplay(toolbarKey, toolKey, _newTool);
			});
			touchModification();
		},
		// resets a tool to the default/starting state on all toolbars
		resetToolDisplay: function(toolKey){
			var _this = this;
			angular.forEach(toolbars, function(toolbarScope, toolbarKey){
				_this.resetToolbarToolDisplay(toolbarKey, toolKey);
			});
			touchModification();
		},
		// update a tool on a specific toolbar
		updateToolbarToolDisplay: function(toolbarKey, toolKey, _newTool){
			if(toolbars[toolbarKey]) toolbars[toolbarKey].updateToolDisplay(toolKey, _newTool);
			else throw('textAngular Error: No Toolbar with name "' + toolbarKey + '" exists');
		},
		// reset a tool on a specific toolbar to it's default starting value
		resetToolbarToolDisplay: function(toolbarKey, toolKey){
			if(toolbars[toolbarKey]) toolbars[toolbarKey].updateToolDisplay(toolKey, taTools[toolKey], true);
			else throw('textAngular Error: No Toolbar with name "' + toolbarKey + '" exists');
		},
		// removes a tool from all toolbars and it's definition
		removeTool: function(toolKey){
			delete taTools[toolKey];
			angular.forEach(toolbars, function(toolbarScope){
				delete toolbarScope.tools[toolKey];
				for(var i = 0; i < toolbarScope.toolbar.length; i++){
					var toolbarIndex;
					for(var j = 0; j < toolbarScope.toolbar[i].length; j++){
						if(toolbarScope.toolbar[i][j] === toolKey){
							toolbarIndex = {
								group: i,
								index: j
							};
							break;
						}
						if(toolbarIndex !== undefined) break;
					}
					if(toolbarIndex !== undefined){
						toolbarScope.toolbar[toolbarIndex.group].slice(toolbarIndex.index, 1);
						toolbarScope._$element.children().eq(toolbarIndex.group).children().eq(toolbarIndex.index).remove();
					}
				}
			});
			touchModification();
		},
		// toolkey, toolDefinition are required. If group is not specified will pick the last group, if index isnt defined will append to group
		addTool: function(toolKey, toolDefinition, group, index){
			taRegisterTool(toolKey, toolDefinition);
			angular.forEach(toolbars, function(toolbarScope){
				toolbarScope.addTool(toolKey, toolDefinition, group, index);
			});
			touchModification();
		},
		// adds a Tool but only to one toolbar not all
		addToolToToolbar: function(toolKey, toolDefinition, toolbarKey, group, index){
			taRegisterTool(toolKey, toolDefinition);
			toolbars[toolbarKey].addTool(toolKey, toolDefinition, group, index);
			touchModification();
		},
		// this is used when externally the html of an editor has been changed and textAngular needs to be notified to update the model.
		// this will call a $digest if not already happening
		refreshEditor: function(name){
			if(editors[name]){
				editors[name].scope.updateTaBindtaTextElement();
				/* istanbul ignore else: phase catch */
				if(!editors[name].scope.$$phase) editors[name].scope.$digest();
			}else throw('textAngular Error: No Editor with name "' + name + '" exists');
			touchModification();
		},
		// this is used by taBind to send a key command in response to a special key event
		sendKeyCommand: function(scope, event){
			var _editor = editors[scope._name];
			/* istanbul ignore else: if nothing to do, do nothing */
			if (_editor && _editor.editorFunctions.sendKeyCommand(event)) {
				/* istanbul ignore else: don't run if already running */
				if(!scope._bUpdateSelectedStyles){
					scope.updateSelectedStyles();
				}
				event.preventDefault();
				return false;
			}
		},
		//
		// When a toolbar and tools are created, it isn't until there is a key event or mouse event
		// that the updateSelectedStyles() is called behind the scenes.
		// This function forces an update through the existing editors to help the application make sure
		// the inital state is correct.
		//
		updateStyles: updateStyles,
		// return the current version of textAngular in use to the user
		getVersion: function () { return textAngularVersion; },
		// for testing
		getToolbarScopes: function () {
			var tmp=[];
			angular.forEach(editors, function (_editor) {
				tmp = tmp.concat(_editor.toolbarScopes);
			});
			return tmp;
		}
/********************** not functional yet
		// save the selection ('range') for the given editor
		saveFocusSelection: function (name, range) {
			editors[name].savedFocusRange = range;
		},
		// restore the saved selection from when the focus was lost
		restoreFocusSelection: function(name, scope) {
			// we only do this if NOT focussed and saved...
			if (editors[name].savedFocusRange && !scope.focussed) {
				try {
					var _r = rangy.restoreRange(editors[name].savedFocusRange);
					var _sel = rangy.getSelection();
					_sel.addRange(_r);
				} catch(e) {}
			}
		}
*************/
	};
}]);
textAngular.directive('textAngularToolbar', [
	'$compile', 'textAngularManager', 'taOptions', 'taTools', 'taToolExecuteAction', '$window',
	function($compile, textAngularManager, taOptions, taTools, taToolExecuteAction, $window){
		return {
			scope: {
				name: '@' // a name IS required
			},
			restrict: "EA",
			link: function(scope, element, attrs){
				if(!scope.name || scope.name === '') throw('textAngular Error: A toolbar requires a name');
				angular.extend(scope, angular.copy(taOptions));
				if(attrs.taToolbar)						scope.toolbar = scope.$parent.$eval(attrs.taToolbar);
				if(attrs.taToolbarClass)				scope.classes.toolbar = attrs.taToolbarClass;
				if(attrs.taToolbarGroupClass)			scope.classes.toolbarGroup = attrs.taToolbarGroupClass;
				if(attrs.taToolbarButtonClass)			scope.classes.toolbarButton = attrs.taToolbarButtonClass;
				if(attrs.taToolbarActiveButtonClass)	scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass;
				if(attrs.taFocussedClass)				scope.classes.focussed = attrs.taFocussedClass;

				scope.disabled = true;
				scope.focussed = false;
				scope._$element = element;
				element[0].innerHTML = '';
				element.addClass("ta-toolbar " + scope.classes.toolbar);

				scope.$watch('focussed', function(){
					if(scope.focussed) element.addClass(scope.classes.focussed);
					else element.removeClass(scope.classes.focussed);
				});

				var setupToolElement = function(toolDefinition, toolScope){
					var toolElement;
					if(toolDefinition && toolDefinition.display){
						toolElement = angular.element(toolDefinition.display);
					}
					else toolElement = angular.element("<button type='button'>");

					if(toolDefinition && toolDefinition["class"]) toolElement.addClass(toolDefinition["class"]);
					else toolElement.addClass(scope.classes.toolbarButton);

					toolElement.attr('name', toolScope.name);
					// important to not take focus from the main text/html entry
					toolElement.attr('ta-button', 'ta-button');
					toolElement.attr('ng-disabled', 'isDisabled()');
					toolElement.attr('tabindex', '-1');
					toolElement.attr('ng-click', 'executeAction()');
					toolElement.attr('ng-class', 'displayActiveToolClass(active)');

					if (toolDefinition && toolDefinition.tooltiptext) {
						toolElement.attr('title', toolDefinition.tooltiptext);
					}
					if(toolDefinition && !toolDefinition.display && !toolScope._display){
						// first clear out the current contents if any
						toolElement[0].innerHTML = '';
						// add the buttonText
						if(toolDefinition.buttontext) toolElement[0].innerHTML = toolDefinition.buttontext;
						// add the icon to the front of the button if there is content
						if(toolDefinition.iconclass){
							var icon = angular.element('<i>'), content = toolElement[0].innerHTML;
							icon.addClass(toolDefinition.iconclass);
							toolElement[0].innerHTML = '';
							toolElement.append(icon);
							if(content && content !== '') toolElement.append('&nbsp;' + content);
						}
					}

					toolScope._lastToolDefinition = angular.copy(toolDefinition);

					return $compile(toolElement)(toolScope);
				};

				// Keep a reference for updating the active states later
				scope.tools = {};
				// create the tools in the toolbar
				// default functions and values to prevent errors in testing and on init
				scope._parent = {
					disabled: true,
					showHtml: false,
					queryFormatBlockState: function(){ return false; },
					queryCommandState: function(){ return false; }
				};
				var defaultChildScope = {
					$window: $window,
					$editor: function(){
						// dynamically gets the editor as it is set
						return scope._parent;
					},
					isDisabled: function(){
						// view selection button is always enabled since it doesn not depend on a selction!
						if (this.name === 'html' && scope._parent.startAction) {
							return false;
						}
						// to set your own disabled logic set a function or boolean on the tool called 'disabled'
						return ( // this bracket is important as without it it just returns the first bracket and ignores the rest
							// when the button's disabled function/value evaluates to true
							(typeof this.$eval('disabled') !== 'function' && this.$eval('disabled')) || this.$eval('disabled()') ||
							// all buttons except the HTML Switch button should be disabled in the showHtml (RAW html) mode
							(this.name !== 'html' && this.$editor().showHtml) ||
							// if the toolbar is disabled
							this.$parent.disabled ||
							// if the current editor is disabled
							this.$editor().disabled
						);
					},
					displayActiveToolClass: function(active){
						return (active)? scope.classes.toolbarButtonActive : '';
					},
					executeAction: taToolExecuteAction
				};

				angular.forEach(scope.toolbar, function(group){
					// setup the toolbar group
					var groupElement = angular.element("<div>");
					groupElement.addClass(scope.classes.toolbarGroup);
					angular.forEach(group, function(tool){
						// init and add the tools to the group
						// a tool name (key name from taTools struct)
						//creates a child scope of the main angularText scope and then extends the childScope with the functions of this particular tool
						// reference to the scope and element kept
						scope.tools[tool] = angular.extend(scope.$new(true), taTools[tool], defaultChildScope, {name: tool});
						scope.tools[tool].$element = setupToolElement(taTools[tool], scope.tools[tool]);
						// append the tool compiled with the childScope to the group element
						groupElement.append(scope.tools[tool].$element);
					});
					// append the group to the toolbar
					element.append(groupElement);
				});

				// update a tool
				// if a value is set to null, remove from the display
				// when forceNew is set to true it will ignore all previous settings, used to reset to taTools definition
				// to reset to defaults pass in taTools[key] as _newTool and forceNew as true, ie `updateToolDisplay(key, taTools[key], true);`
				scope.updateToolDisplay = function(key, _newTool, forceNew){
					var toolInstance = scope.tools[key];
					if(toolInstance){
						// get the last toolDefinition, then override with the new definition
						if(toolInstance._lastToolDefinition && !forceNew) _newTool = angular.extend({}, toolInstance._lastToolDefinition, _newTool);
						if(_newTool.buttontext === null && _newTool.iconclass === null && _newTool.display === null)
							throw('textAngular Error: Tool Definition for updating "' + key + '" does not have a valid display/iconclass/buttontext value');

						// if tool is defined on this toolbar, update/redo the tool
						if(_newTool.buttontext === null){
							delete _newTool.buttontext;
						}
						if(_newTool.iconclass === null){
							delete _newTool.iconclass;
						}
						if(_newTool.display === null){
							delete _newTool.display;
						}

						var toolElement = setupToolElement(_newTool, toolInstance);
						toolInstance.$element.replaceWith(toolElement);
						toolInstance.$element = toolElement;
					}
				};

				// we assume here that all values passed are valid and correct
				scope.addTool = function(key, _newTool, groupIndex, index){
					scope.tools[key] = angular.extend(scope.$new(true), taTools[key], defaultChildScope, {name: key});
					scope.tools[key].$element = setupToolElement(taTools[key], scope.tools[key]);
					var group;
					if(groupIndex === undefined) groupIndex = scope.toolbar.length - 1;
					group = angular.element(element.children()[groupIndex]);

					if(index === undefined){
						group.append(scope.tools[key].$element);
						scope.toolbar[groupIndex][scope.toolbar[groupIndex].length - 1] = key;
					}else{
						group.children().eq(index).after(scope.tools[key].$element);
						scope.toolbar[groupIndex][index] = key;
					}
				};

				textAngularManager.registerToolbar(scope);

				scope.$on('$destroy', function(){
					textAngularManager.unregisterToolbar(scope.name);
				});
			}
		};
	}
]);
textAngular.directive('textAngularVersion', ['textAngularManager',
	function(textAngularManager) {
		var version = textAngularManager.getVersion();
		return {
			restrict: "EA",
			link: function (scope, element, attrs) {
				element.html(version);
			}
		};
	}
]);
