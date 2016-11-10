angular.module('textAngular.DOM', ['textAngular.factories'])
.factory('taExecCommand', ['taSelection', 'taBrowserTag', '$document', function(taSelection, taBrowserTag, $document){
	var listToDefault = function(listElement, defaultWrap){
		var $target, i;
		// if all selected then we should remove the list
		// grab all li elements and convert to taDefaultWrap tags
		var children = listElement.find('li');
		for(i = children.length - 1; i >= 0; i--){
			$target = angular.element('<' + defaultWrap + '>' + children[i].innerHTML + '</' + defaultWrap + '>');
			listElement.after($target);
		}
		listElement.remove();
		taSelection.setSelectionToElementEnd($target[0]);
	};
	var listElementToSelfTag = function(list, listElement, selfTag, bDefault, defaultWrap){
		var $target, i;
		// if all selected then we should remove the list
		// grab all li elements
		var priorElement;
		var nextElement;
		var children = list.find('li');
		var foundIndex;
		for (i = 0; i<children.length; i++) {
			if (children[i].outerHTML === listElement[0].outerHTML) {
				// found it...
				foundIndex = i;
				if (i>0) {
					priorElement = children[i-1];
				}
				if (i+1<children.length) {
					nextElement = children[i+1];
				}
				break;
			}
		}
		//console.log('listElementToSelfTag', list, listElement, selfTag, bDefault, priorElement, nextElement);
		// un-list the listElement
		var html = '';
		if (bDefault) {
			html += '<' + defaultWrap + '>' + listElement[0].innerHTML + '</' + defaultWrap + '>';
		} else {
			html += '<' + taBrowserTag(selfTag) + '>';
			html += '<li>' + listElement[0].innerHTML + '</li>';
			html += '</' + taBrowserTag(selfTag) + '>';
		}
		$target = angular.element(html);
		//console.log('$target', $target[0]);
		if (!priorElement) {
			// this is the first the list, so we just remove it...
			listElement.remove();
			list.after(angular.element(list[0].outerHTML));
			list.after($target);
			list.remove();
			taSelection.setSelectionToElementEnd($target[0]);
			return;
		} else if (!nextElement) {
			// this is the last in the list, so we just remove it..
			listElement.remove();
			list.after($target);
			taSelection.setSelectionToElementEnd($target[0]);
		} else {
			var p = list.parent();
			// okay it was some where in the middle... so we need to break apart the list...
			var html1 = '';
			var listTag = list[0].nodeName.toLowerCase();
			html1 += '<' + listTag + '>';
			for(i = 0; i < foundIndex; i++){
				html1 += '<li>' + children[i].innerHTML + '</li>';
			}
			html1 += '</' + listTag + '>';
			var html2 = '';
			html2 += '<' + listTag + '>';
			for(i = foundIndex+1; i < children.length; i++){
				html2 += '<li>' + children[i].innerHTML + '</li>';
			}
			html2 += '</' + listTag + '>';
			//console.log(html1, $target[0], html2);
			list.after(angular.element(html2));
			list.after($target);
			list.after(angular.element(html1));
			list.remove();
			//console.log('parent ******XXX*****', p[0]);
			taSelection.setSelectionToElementEnd($target[0]);
		}
	};
	var listElementsToSelfTag = function(list, listElements, selfTag, bDefault, defaultWrap){
		var $target, i, j, p;
		// grab all li elements
		var priorElement;
		var afterElement;
		//console.log('list:', list, 'listElements:', listElements, 'selfTag:', selfTag, 'bDefault:', bDefault);
		var children = list.find('li');
		var foundIndexes = [];
		for (i = 0; i<children.length; i++) {
			for (j = 0; j<listElements.length; j++) {
				if (children[i].isEqualNode(listElements[j])) {
					// found it...
					foundIndexes[j] = i;
				}
			}
		}
		if (foundIndexes[0] > 0) {
			priorElement = children[foundIndexes[0] - 1];
		}
		if (foundIndexes[listElements.length-1] + 1 < children.length) {
			afterElement = children[foundIndexes[listElements.length-1] + 1];
		}
		//console.log('listElementsToSelfTag', list, listElements, selfTag, bDefault, !priorElement, !afterElement, foundIndexes[listElements.length-1], children.length);
		// un-list the listElements
		var html = '';
		if (bDefault) {
			for (j = 0; j < listElements.length; j++) {
				html += '<' + defaultWrap + '>' + listElements[j].innerHTML + '</' + defaultWrap + '>';
				listElements[j].remove();
			}
		} else {
			html += '<' + taBrowserTag(selfTag) + '>';
			for (j = 0; j < listElements.length; j++) {
				html += listElements[j].outerHTML;
				listElements[j].remove();
			}
			html += '</' + taBrowserTag(selfTag) + '>';
		}
		$target = angular.element(html);
		if (!priorElement) {
			// this is the first the list, so we just remove it...
			list.after(angular.element(list[0].outerHTML));
			list.after($target);
			list.remove();
			taSelection.setSelectionToElementEnd($target[0]);
			return;
		} else if (!afterElement) {
			// this is the last in the list, so we just remove it..
			list.after($target);
			taSelection.setSelectionToElementEnd($target[0]);
			return;
		} else {
			// okay it was some where in the middle... so we need to break apart the list...
			var html1 = '';
			var listTag = list[0].nodeName.toLowerCase();
			html1 += '<' + listTag + '>';
			for(i = 0; i < foundIndexes[0]; i++){
				html1 += '<li>' + children[i].innerHTML + '</li>';
			}
			html1 += '</' + listTag + '>';
			var html2 = '';
			html2 += '<' + listTag + '>';
			for(i = foundIndexes[listElements.length-1]+1; i < children.length; i++){
				html2 += '<li>' + children[i].innerHTML + '</li>';
			}
			html2 += '</' + listTag + '>';
			list.after(angular.element(html2));
			list.after($target);
			list.after(angular.element(html1));
			list.remove();
			//console.log('parent ******YYY*****', list.parent()[0]);
			taSelection.setSelectionToElementEnd($target[0]);
		}
	};
	var selectLi = function(liElement){
		if(/(<br(|\/)>)$/i.test(liElement.innerHTML.trim())) taSelection.setSelectionBeforeElement(angular.element(liElement).find("br")[0]);
		else taSelection.setSelectionToElementEnd(liElement);
	};
	var listToList = function(listElement, newListTag){
		var $target = angular.element('<' + newListTag + '>' + listElement[0].innerHTML + '</' + newListTag + '>');
		listElement.after($target);
		listElement.remove();
		selectLi($target.find('li')[0]);
	};
	var childElementsToList = function(elements, listElement, newListTag){
		var html = '';
		for(var i = 0; i < elements.length; i++){
			html += '<' + taBrowserTag('li') + '>' + elements[i].innerHTML + '</' + taBrowserTag('li') + '>';
		}
		var $target = angular.element('<' + newListTag + '>' + html + '</' + newListTag + '>');
		listElement.after($target);
		listElement.remove();
		selectLi($target.find('li')[0]);
	};
	var turnBlockIntoBlocks = function(element, options) {
		for(var i = 0; i<element.childNodes.length; i++) {
			var _n = element.childNodes[i];
			/* istanbul ignore next - more complex testing*/
			if (_n.tagName && _n.tagName.match(BLOCKELEMENTS)) {
				turnBlockIntoBlocks(_n, options);
			}
		}
		/* istanbul ignore next - very rare condition that we do not test*/
		if (element.parentNode === null) {
			// nothing left to do..
			return element;
		}
		/* istanbul ignore next - not sure have to test this */
		if (options === '<br>'){
			return element;
		}
		else {
			var $target = angular.element(options);
			$target[0].innerHTML = element.innerHTML;
			element.parentNode.insertBefore($target[0], element);
			element.parentNode.removeChild(element);
			return $target;
		}
	};
	return function(taDefaultWrap, topNode){
		// NOTE: here we are dealing with the html directly from the browser and not the html the user sees.
		// IF you want to modify the html the user sees, do it when the user does a switchView
		taDefaultWrap = taBrowserTag(taDefaultWrap);
		return function(command, showUI, options, defaultTagAttributes){
			var i, $target, html, _nodes, next, optionsTagName, selectedElement, ourSelection;
			var defaultWrapper = angular.element('<' + taDefaultWrap + '>');
			try{
				if (taSelection.getSelection) {
					ourSelection = taSelection.getSelection();
				}
				selectedElement = taSelection.getSelectionElement();
				// special checks and fixes when we are selecting the whole container
				var __h, _innerNode;
				/* istanbul ignore next */
                if (selectedElement.tagName !== undefined) {
                    if (selectedElement.tagName.toLowerCase() === 'div' &&
                        /taTextElement.+/.test(selectedElement.id) &&
                        ourSelection && ourSelection.start &&
                        ourSelection.start.offset === 1 &&
                        ourSelection.end.offset === 1) {
                        // opps we are actually selecting the whole container!
                        //console.log('selecting whole container!');
                        __h = selectedElement.innerHTML;
                        if (/<br>/i.test(__h)) {
                            // Firefox adds <br>'s and so we remove the <br>
                            __h = __h.replace(/<br>/i, '&#8203;');  // no space-space
                        }
                        if (/<br\/>/i.test(__h)) {
                            // Firefox adds <br/>'s and so we remove the <br/>
                            __h = __h.replace(/<br\/>/i, '&#8203;');  // no space-space
                        }
                        // remove stacked up <span>'s
                        if (/<span>(<span>)+/i.test(__h)) {
                            __h = __.replace(/<span>(<span>)+/i, '<span>');
                        }
                        // remove stacked up </span>'s
                        if (/<\/span>(<\/span>)+/i.test(__h)) {
                            __h = __.replace(/<\/span>(<\/span>)+/i, '<\/span>');
                        }
                        if (/<span><\/span>/i.test(__h)) {
                            // if we end up with a <span></span> here we remove it...
                            __h = __h.replace(/<span><\/span>/i, '');
                        }
                        //console.log('inner whole container', selectedElement.childNodes);
                        _innerNode = '<div>' + __h + '</div>';
                        selectedElement.innerHTML = _innerNode;
                        //console.log('childNodes:', selectedElement.childNodes);
                        taSelection.setSelectionToElementEnd(selectedElement.childNodes[0]);
                        selectedElement = taSelection.getSelectionElement();
                    } else if (selectedElement.tagName.toLowerCase() === 'span' &&
                        ourSelection && ourSelection.start &&
                        ourSelection.start.offset === 1 &&
                        ourSelection.end.offset === 1) {
                        // just a span -- this is a problem...
                        //console.log('selecting span!');
                        __h = selectedElement.innerHTML;
                        if (/<br>/i.test(__h)) {
                            // Firefox adds <br>'s and so we remove the <br>
                            __h = __h.replace(/<br>/i, '&#8203;');  // no space-space
                        }
                        if (/<br\/>/i.test(__h)) {
                            // Firefox adds <br/>'s and so we remove the <br/>
                            __h = __h.replace(/<br\/>/i, '&#8203;');  // no space-space
                        }
                        // remove stacked up <span>'s
                        if (/<span>(<span>)+/i.test(__h)) {
                            __h = __.replace(/<span>(<span>)+/i, '<span>');
                        }
                        // remove stacked up </span>'s
                        if (/<\/span>(<\/span>)+/i.test(__h)) {
                            __h = __.replace(/<\/span>(<\/span>)+/i, '<\/span>');
                        }
                        if (/<span><\/span>/i.test(__h)) {
                            // if we end up with a <span></span> here we remove it...
                            __h = __h.replace(/<span><\/span>/i, '');
                        }
                        //console.log('inner span', selectedElement.childNodes);
                        // we wrap this in a <div> because otherwise the browser get confused when we attempt to select the whole node
                        // and the focus is not set correctly no matter what we do
                        _innerNode = '<div>' + __h + '</div>';
                        selectedElement.innerHTML = _innerNode;
                        taSelection.setSelectionToElementEnd(selectedElement.childNodes[0]);
                        selectedElement = taSelection.getSelectionElement();
                        //console.log(selectedElement.innerHTML);
                    } else if (selectedElement.tagName.toLowerCase() === 'p' &&
                        ourSelection && ourSelection.start &&
                        ourSelection.start.offset === 1 &&
                        ourSelection.end.offset === 1) {
                        //console.log('p special');
                        // we need to remove the </br> that firefox adds!
                        __h = selectedElement.innerHTML;
                        if (/<br>/i.test(__h)) {
                            // Firefox adds <br>'s and so we remove the <br>
                            __h = __h.replace(/<br>/i, '&#8203;');  // no space-space
							selectedElement.innerHTML = __h;
							taSelection.setSelectionToElementEnd(selectedElement.childNodes[0]);
							selectedElement = taSelection.getSelectionElement();
                        }
                    } else if (selectedElement.tagName.toLowerCase() === 'li' &&
                        ourSelection && ourSelection.start &&
                        ourSelection.start.offset === ourSelection.end.offset) {
                        // we need to remove the </br> that firefox adds!
                        __h = selectedElement.innerHTML;
                        if (/<br>/i.test(__h)) {
                            // Firefox adds <br>'s and so we remove the <br>
                            __h = __h.replace(/<br>/i, '');  // nothing
							selectedElement.innerHTML = __h;
							taSelection.setSelectionToElementEnd(selectedElement.childNodes[0]);
							selectedElement = taSelection.getSelectionElement();
                        }
                    }
                }
            }catch(e){}
			//console.log('************** selectedElement:', selectedElement);
			/* istanbul ignore if: */
			if (!selectedElement){return;}
			var $selected = angular.element(selectedElement);
			var tagName = (selectedElement && selectedElement.tagName && selectedElement.tagName.toLowerCase()) ||
				/* istanbul ignore next: */ "";
			if(command.toLowerCase() === 'insertorderedlist' || command.toLowerCase() === 'insertunorderedlist'){
				var selfTag = taBrowserTag((command.toLowerCase() === 'insertorderedlist')? 'ol' : 'ul');
				var selectedElements = taSelection.getOnlySelectedElements();
				//console.log('PPPPPPPPPPPPP', tagName, selfTag, selectedElements, tagName.match(BLOCKELEMENTS), $selected.hasClass('ta-bind'), $selected.parent()[0].tagName);
				if (selectedElements.length>1 && (tagName === 'ol' ||  tagName === 'ul' )) {
					return listElementsToSelfTag($selected, selectedElements, selfTag, selfTag===tagName, taDefaultWrap);
				}
				if(tagName === selfTag){
					// if all selected then we should remove the list
					// grab all li elements and convert to taDefaultWrap tags
					//console.log('tagName===selfTag');
					if ($selected[0].childNodes.length !== selectedElements.length && selectedElements.length===1) {
						$selected = angular.element(selectedElements[0]);
						return listElementToSelfTag($selected.parent(), $selected, selfTag, true, taDefaultWrap);
					} else {
						return listToDefault($selected, taDefaultWrap);
					}
				}else if(tagName === 'li' &&
					$selected.parent()[0].tagName.toLowerCase() === selfTag &&
					$selected.parent().children().length === 1){
					// catch for the previous statement if only one li exists
					return listToDefault($selected.parent(), taDefaultWrap);
				}else if(tagName === 'li' &&
					$selected.parent()[0].tagName.toLowerCase() !== selfTag &&
					$selected.parent().children().length === 1){
					// catch for the previous statement if only one li exists
					return listToList($selected.parent(), selfTag);
				}else if(tagName.match(BLOCKELEMENTS) && !$selected.hasClass('ta-bind')){
					// if it's one of those block elements we have to change the contents
					// if it's a ol/ul we are changing from one to the other
					if (selectedElements.length) {
						if ($selected[0].childNodes.length !== selectedElements.length && selectedElements.length===1) {
							//console.log('&&&&&&&&&&&&&&& --------- &&&&&&&&&&&&&&&&', selectedElements[0], $selected[0].childNodes);
							$selected = angular.element(selectedElements[0]);
							return listElementToSelfTag($selected.parent(), $selected, selfTag, selfTag===tagName, taDefaultWrap);
						}
					}
					if(tagName === 'ol' || tagName === 'ul'){
						// now if this is a set of selected elements... behave diferently
						return listToList($selected, selfTag);
					}else{
						var childBlockElements = false;
						angular.forEach($selected.children(), function(elem){
							if(elem.tagName.match(BLOCKELEMENTS)) {
								childBlockElements = true;
							}
						});
						if(childBlockElements){
							return childElementsToList($selected.children(), $selected, selfTag);
						}else{
							return childElementsToList([angular.element('<div>' + selectedElement.innerHTML + '</div>')[0]], $selected, selfTag);
						}
					}
				}else if(tagName.match(BLOCKELEMENTS)){
					// if we get here then the contents of the ta-bind are selected
					_nodes = taSelection.getOnlySelectedElements();
					//console.log('_nodes', _nodes, tagName);
					if(_nodes.length === 0){
						// here is if there is only text in ta-bind ie <div ta-bind>test content</div>
						$target = angular.element('<' + selfTag + '><li>' + selectedElement.innerHTML + '</li></' + selfTag + '>');
						$selected.html('');
						$selected.append($target);
					}else if(_nodes.length === 1 && (_nodes[0].tagName.toLowerCase() === 'ol' || _nodes[0].tagName.toLowerCase() === 'ul')){
						if(_nodes[0].tagName.toLowerCase() === selfTag){
							// remove
							return listToDefault(angular.element(_nodes[0]), taDefaultWrap);
						}else{
							return listToList(angular.element(_nodes[0]), selfTag);
						}
					}else{
						html = '';
						var $nodes = [];
						for(i = 0; i < _nodes.length; i++){
							/* istanbul ignore else: catch for real-world can't make it occur in testing */
							if(_nodes[i].nodeType !== 3){
								var $n = angular.element(_nodes[i]);
								/* istanbul ignore if: browser check only, phantomjs doesn't return children nodes but chrome at least does */
								if(_nodes[i].tagName.toLowerCase() === 'li') continue;
								else if(_nodes[i].tagName.toLowerCase() === 'ol' || _nodes[i].tagName.toLowerCase() === 'ul'){
									html += $n[0].innerHTML; // if it's a list, add all it's children
								}else if(_nodes[i].tagName.toLowerCase() === 'span' && (_nodes[i].childNodes[0].tagName.toLowerCase() === 'ol' || _nodes[i].childNodes[0].tagName.toLowerCase() === 'ul')){
									html += $n[0].childNodes[0].innerHTML; // if it's a list, add all it's children
								}else{
									html += '<' + taBrowserTag('li') + '>' + $n[0].innerHTML + '</' + taBrowserTag('li') + '>';
								}
								$nodes.unshift($n);
							}
						}
						//console.log('$nodes', $nodes);
						$target = angular.element('<' + selfTag + '>' + html + '</' + selfTag + '>');
						$nodes.pop().replaceWith($target);
						angular.forEach($nodes, function($node){ $node.remove(); });
					}
					taSelection.setSelectionToElementEnd($target[0]);
					return;
				}
			}else if(command.toLowerCase() === 'formatblock'){
				optionsTagName = options.toLowerCase().replace(/[<>]/ig, '');
				if(optionsTagName.trim() === 'default') {
					optionsTagName = taDefaultWrap;
					options = '<' + taDefaultWrap + '>';
				}
				if(tagName === 'li') {
					$target = $selected.parent();
				}
				else {
					$target = $selected;
				}
				// find the first blockElement
				while(!$target[0].tagName || !$target[0].tagName.match(BLOCKELEMENTS) && !$target.parent().attr('contenteditable')){
					$target = $target.parent();
					/* istanbul ignore next */
					tagName = ($target[0].tagName || '').toLowerCase();
				}
				if(tagName === optionsTagName){
					// $target is wrap element
					_nodes = $target.children();
					var hasBlock = false;
					for(i = 0; i < _nodes.length; i++){
						hasBlock = hasBlock || _nodes[i].tagName.match(BLOCKELEMENTS);
					}
					if(hasBlock){
						$target.after(_nodes);
						next = $target.next();
						$target.remove();
						$target = next;
					}else{
						defaultWrapper.append($target[0].childNodes);
						$target.after(defaultWrapper);
						$target.remove();
						$target = defaultWrapper;
					}
				}else if($target.parent()[0].tagName.toLowerCase() === optionsTagName &&
					!$target.parent().hasClass('ta-bind')){
					//unwrap logic for parent
					var blockElement = $target.parent();
					var contents = blockElement.contents();
					for(i = 0; i < contents.length; i ++){
						/* istanbul ignore next: can't test - some wierd thing with how phantomjs works */
						if(blockElement.parent().hasClass('ta-bind') && contents[i].nodeType === 3){
							defaultWrapper = angular.element('<' + taDefaultWrap + '>');
							defaultWrapper[0].innerHTML = contents[i].outerHTML;
							contents[i] = defaultWrapper[0];
						}
						blockElement.parent()[0].insertBefore(contents[i], blockElement[0]);
					}
					blockElement.remove();
				}else if(tagName.match(LISTELEMENTS)){
					// wrapping a list element
					$target.wrap(options);
				}else{
					// default wrap behaviour
					_nodes = taSelection.getOnlySelectedElements();
					if(_nodes.length === 0) {
						// no nodes at all....
						_nodes = [$target[0]];
					}
					// find the parent block element if any of the nodes are inline or text
					for(i = 0; i < _nodes.length; i++){
						if(_nodes[i].nodeType === 3 || !_nodes[i].tagName.match(BLOCKELEMENTS)){
							while(_nodes[i].nodeType === 3 || !_nodes[i].tagName || !_nodes[i].tagName.match(BLOCKELEMENTS)){
								_nodes[i] = _nodes[i].parentNode;
							}
						}
					}
					// remove any duplicates from the array of _nodes!
					_nodes = _nodes.filter(function(value, index, self) {
						return self.indexOf(value) === index;
					});
					// remove all whole taTextElement if it is here... unless it is the only element!
					if (_nodes.length>1) {
						_nodes = _nodes.filter(function (value, index, self) {
							return !(value.nodeName.toLowerCase() === 'div' && /^taTextElement/.test(value.id));
						});
					}
					if(angular.element(_nodes[0]).hasClass('ta-bind')){
						$target = angular.element(options);
						$target[0].innerHTML = _nodes[0].innerHTML;
						_nodes[0].innerHTML = $target[0].outerHTML;
					}else if(optionsTagName === 'blockquote'){
						// blockquotes wrap other block elements
						html = '';
						for(i = 0; i < _nodes.length; i++){
							html += _nodes[i].outerHTML;
						}
						$target = angular.element(options);
						$target[0].innerHTML = html;
						_nodes[0].parentNode.insertBefore($target[0],_nodes[0]);
						for(i = _nodes.length - 1; i >= 0; i--){
							/* istanbul ignore else:  */
							if (_nodes[i].parentNode) _nodes[i].parentNode.removeChild(_nodes[i]);
						}
					} else /* istanbul ignore next: not tested since identical to blockquote */
					if (optionsTagName === 'pre' && taSelection.getStateShiftKey()) {
						//console.log('shift pre', _nodes);
						// pre wrap other block elements
						html = '';
						for (i = 0; i < _nodes.length; i++) {
							html += _nodes[i].outerHTML;
						}
						$target = angular.element(options);
						$target[0].innerHTML = html;
						_nodes[0].parentNode.insertBefore($target[0], _nodes[0]);
						for (i = _nodes.length - 1; i >= 0; i--) {
							/* istanbul ignore else:  */
							if (_nodes[i].parentNode) _nodes[i].parentNode.removeChild(_nodes[i]);
						}
					}
					else {
						//console.log(optionsTagName, _nodes);
						// regular block elements replace other block elements
						for (i = 0; i < _nodes.length; i++) {
							var newBlock = turnBlockIntoBlocks(_nodes[i], options);
							if (_nodes[i] === $target[0]) {
								$target = angular.element(newBlock);
							}
						}
					}
				}
				taSelection.setSelectionToElementEnd($target[0]);
				// looses focus when we have the whole container selected and no text!
				// refocus on the shown display element, this fixes a bug when using firefox
				$target[0].focus();
				return;
			}else if(command.toLowerCase() === 'createlink'){
				/* istanbul ignore next: firefox specific fix */
				if (tagName === 'a') {
					// already a link!!! we are just replacing it...
					taSelection.getSelectionElement().href = options;
					return;
				}
				var tagBegin = '<a href="' + options + '" target="' +
						(defaultTagAttributes.a.target ? defaultTagAttributes.a.target : '') +
						'">',
					tagEnd = '</a>',
					_selection = taSelection.getSelection();
				if(_selection.collapsed){
					// insert text at selection, then select then just let normal exec-command run
					taSelection.insertHtml(tagBegin + options + tagEnd, topNode);
				}else if(rangy.getSelection().getRangeAt(0).canSurroundContents()){
					var node = angular.element(tagBegin + tagEnd)[0];
					rangy.getSelection().getRangeAt(0).surroundContents(node);
				}
				return;
			}else if(command.toLowerCase() === 'inserthtml'){
				taSelection.insertHtml(options, topNode);
				return;
			}
			try{
				$document[0].execCommand(command, showUI, options);
			}catch(e){}
		};
	};
}]).service('taSelection', ['$document', 'taDOM', '$log',
/* istanbul ignore next: all browser specifics and PhantomJS dosen't seem to support half of it */
function($document, taDOM, $log){
	// need to dereference the document else the calls don't work correctly
	var _document = $document[0];
	var bShiftState;
	var brException = function (element, offset) {
		/* check if selection is a BR element at the beginning of a container. If so, get
		* the parentNode instead.
		* offset should be zero in this case. Otherwise, return the original
		* element.
		*/
		if (element.tagName && element.tagName.match(/^br$/i) && offset === 0 && !element.previousSibling) {
            return {
                element: element.parentNode,
                offset: 0
            };
		} else {
			return {
				element: element,
				offset: offset
			};
		}
	};
	var api = {
		getSelection: function(){
			var range;
			try {
				// catch any errors from rangy and ignore the issue
				range = rangy.getSelection().getRangeAt(0);
			} catch(e) {
				//console.info(e);
				return undefined;
			}
			var container = range.commonAncestorContainer;
            var selection = {
				start: brException(range.startContainer, range.startOffset),
				end: brException(range.endContainer, range.endOffset),
				collapsed: range.collapsed
			};
            // This has problems under Firefox.
            // On Firefox with
            // <p>Try me !</p>
            // <ul>
            // <li>line 1</li>
            // <li>line 2</li>
            // </ul>
            // <p>line 3</p>
            // <ul>
            // <li>line 4</li>
            // <li>line 5</li>
            // </ul>
            // <p>Hello textAngular</p>
            // WITH the cursor after the 3 on line 3, it gets the commonAncestorContainer as:
            // <TextNode textContent='line 3'>
            // AND Chrome gets the commonAncestorContainer as:
            // <p>line 3</p>
            //
			// Check if the container is a text node and return its parent if so
            // unless this is the whole taTextElement.  If so we return the textNode
			if (container.nodeType === 3) {
                if (container.parentNode.nodeName.toLowerCase() === 'div' &&
                    /^taTextElement/.test(container.parentNode.id)) {
                    // textNode where the parent is the whole <div>!!!
					//console.log('textNode ***************** container:', container);
                } else {
                    container = container.parentNode;
                }
            }
			if (container.nodeName.toLowerCase() === 'div' &&
				/^taTextElement/.test(container.id)) {
				//console.log('*********taTextElement************');
				//console.log('commonAncestorContainer:', container);
				selection.start.element = container.childNodes[selection.start.offset];
				selection.end.element = container.childNodes[selection.end.offset];
				selection.container = container;
			} else {
				if (container.parentNode === selection.start.element ||
					container.parentNode === selection.end.element) {
					selection.container = container.parentNode;
				} else {
					selection.container = container;
				}
			}
			//console.log('***selection container:', selection.container.nodeName, selection.start.offset, selection.container);
			return selection;
		},
		// if we use the LEFT_ARROW and we are at the special place <span>&#65279;</span> we move the cursor over by one...
		// Chrome and Firefox behave differently so so fix this for Firefox here.  No adjustment needed for Chrome.
		updateLeftArrowKey: function(element) {
			var range = rangy.getSelection().getRangeAt(0);
			if (range && range.collapsed) {
				var _nodes = api.getFlattenedDom(range);
				if (!_nodes.findIndex) return;
				var _node = range.startContainer;
				var indexStartContainer = _nodes.findIndex(function(element, index){
					if (element.node===_node) return true;
					var _indexp = element.parents.indexOf(_node);
					return (_indexp !== -1);
				});
				var m;
				var nextNodeToRight;
				//console.log('indexStartContainer', indexStartContainer, _nodes.length, 'startContainer:', _node, _node === _nodes[indexStartContainer].node);
				_nodes.forEach(function (n, i) {
					//console.log(i, n.node);
					n.parents.forEach(function (nn, j){
						//console.log(i, j, nn);
					});
				});
				if (indexStartContainer+1 < _nodes.length) {
					// we need the node just after this startContainer
					// so we can check and see it this is a special place
					nextNodeToRight = _nodes[indexStartContainer+1].node;
					//console.log(nextNodeToRight, range.startContainer);
				}
				//console.log('updateLeftArrowKey', range.startOffset, range.startContainer.textContent);
				// this first section handles the case for Chrome browser
				// if the first character of the nextNode is a \ufeff we know that we are just before the special span...
				// and so we most left by one character
				if (nextNodeToRight && nextNodeToRight.textContent) {
					m = /^\ufeff([^\ufeff]*)$/.exec(nextNodeToRight.textContent);
					if (m) {
						// we are before the special node with begins with a \ufeff character
						//console.log('LEFT ...found it...', 'startOffset:', range.startOffset, m[0].length, m[1].length);
						// no need to change anything in this case
						return;
					}
				}
				var nextNodeToLeft;
				if (indexStartContainer > 0) {
					// we need the node just after this startContainer
					// so we can check and see it this is a special place
					nextNodeToLeft = _nodes[indexStartContainer-1].node;
					//console.log(nextNodeToLeft, nextNodeToLeft);
				}
				if (range.startOffset === 0 && nextNodeToLeft) {
					//console.log(nextNodeToLeft, range.startOffset, nextNodeToLeft.textContent);
					m = /^\ufeff([^\ufeff]*)$/.exec(nextNodeToLeft.textContent);
					if (m) {
						//console.log('LEFT &&&&&&&&&&&&&&&&&&&...found it...&&&&&&&&&&&', nextNodeToLeft, m[0].length, m[1].length);
						// move over to the left my one -- Firefox triggers this case
						api.setSelectionToElementEnd(nextNodeToLeft);
						return;
					}
				}
			}
			return;
		},
		// if we use the RIGHT_ARROW and we are at the special place <span>&#65279;</span> we move the cursor over by one...
		updateRightArrowKey: function(element) {
			// we do not need to make any adjustments here, so we ignore all this code
			if (false) {
				var range = rangy.getSelection().getRangeAt(0);
				if (range && range.collapsed) {
					var _nodes = api.getFlattenedDom(range);
					if (!_nodes.findIndex) return;
					var _node = range.startContainer;
					var indexStartContainer = _nodes.findIndex(function (element, index) {
						if (element.node === _node) return true;
						var _indexp = element.parents.indexOf(_node);
						return (_indexp !== -1);
					});
					var _sel;
					var i;
					var m;

					// if the last character is a \ufeff we know that we are just before the special span...
					// and so we most right by one character
					var indexFound = _nodes.findIndex(function (n, index) {
						if (n.textContent) {
							var m = /^\ufeff([^\ufeff]*)$/.exec(n.textContent);
							if (m) {
								return true;
							} else {
								return false;
							}
						} else {
							return false;
						}
					});
					if (indexFound === -1) {
						return;
					}
					//console.log(indexFound, range.startContainer, range.startOffset);
					_node = _nodes[indexStartContainer];
					//console.log('indexStartContainer', indexStartContainer);
					if (_node && _node.textContent) {
						m = /^\ufeff([^\ufeff]*)$/.exec(_node.textContent);
						if (m && range.startOffset - 1 === m[1].length) {
							//console.log('RIGHT found it...&&&&&&&&&&&', range.startOffset);
							// no need to make any adjustment
							return;
						}
					}
					//console.log(range.startOffset);
					if (_nodes && range.startOffset === 0) {
						indexStartContainer = _nodes.indexOf(range.startContainer);
						if (indexStartContainer !== -1 && indexStartContainer > 0) {
							_node = _nodes[indexStartContainer - 1];
							if (_node.textContent) {
								m = /\ufeff([^\ufeff]*)$/.exec(_node.textContent);
								if (m && true || range.startOffset === m[1].length + 1) {
									//console.log('RIGHT &&&&&&&&&&&&&&&&&&&...found it...&&&&&&&&&&&', range.startOffset, m[1].length);
									// no need to make any adjustment
									return;
								}
							}
						}
					}
				}
			}
		},
		getFlattenedDom: function(range) {
			var parent = range.commonAncestorContainer.parentNode;
			if (!parent) {
				return range.commonAncestorContainer.childNodes;
			}
			var nodes = Array.prototype.slice.call(parent.childNodes); // converts NodeList to Array
			var indexStartContainer = nodes.indexOf(range.startContainer);
			// make sure that we have a big enough set of nodes
			if (indexStartContainer+1 < nodes.length && indexStartContainer > 0) {
				// we are good
				// we can go down one node or up one node
			} else {
				if (parent.parentNode) {
					parent = parent.parentNode;
				}
			}
			// now walk the parent
			nodes = [];
			function addNodes(_set) {
				if (_set.node.childNodes.length) {
					var childNodes = Array.prototype.slice.call(_set.node.childNodes); // converts NodeList to Array
					childNodes.forEach(function(n) {
						var _t = _set.parents.slice();
						if (_t.slice(-1)[0]!==_set.node) {
							_t.push(_set.node);
						}
						addNodes({parents: _t, node: n});
					});
				} else {
					nodes.push({parents: _set.parents, node: _set.node});
				}
			}
			addNodes({parents: [parent], node: parent});
			return nodes;
		},
		getOnlySelectedElements: function(){
			var range = rangy.getSelection().getRangeAt(0);
			var container = range.commonAncestorContainer;
			// Node.TEXT_NODE === 3
			// Node.ELEMENT_NODE === 1
			// Node.COMMENT_NODE === 8
			// Check if the container is a text node and return its parent if so
			container = container.nodeType === 3 ? container.parentNode : container;
			// get the nodes in the range that are ELEMENT_NODE and are children of the container
			// in this range...
			return range.getNodes([1], function(node){
				return node.parentNode === container;
			});
		},
		// this includes the container element if all children are selected
		getAllSelectedElements: function(){
			var range = rangy.getSelection().getRangeAt(0);
			var container = range.commonAncestorContainer;
			// Node.TEXT_NODE === 3
			// Node.ELEMENT_NODE === 1
			// Node.COMMENT_NODE === 8
			// Check if the container is a text node and return its parent if so
			container = container.nodeType === 3 ? container.parentNode : container;
			// get the nodes in the range that are ELEMENT_NODE and are children of the container
			// in this range...
			var selectedNodes = range.getNodes([1], function(node){
				return node.parentNode === container;
			});
			var innerHtml = container.innerHTML;
			// remove the junk that rangy has put down
			innerHtml = innerHtml.replace(/<span id=.selectionBoundary[^>]+>\ufeff?<\/span>/ig, '');
			//console.log(innerHtml);
			//console.log(range.toHtml());
			//console.log(innerHtml === range.toHtml());
			if (innerHtml === range.toHtml() &&
				// not the whole taTextElement
				(!(container.nodeName.toLowerCase() === 'div' &&  /^taTextElement/.test(container.id)))
			) {
				var arr = [];
				for(var i = selectedNodes.length; i--; arr.unshift(selectedNodes[i]));
				selectedNodes = arr;
				selectedNodes.push(container);
				//$log.debug(selectedNodes);
			}
			return selectedNodes;
		},
		// Some basic selection functions
		getSelectionElement: function () {
			var s = api.getSelection();
			if (s) {
				return api.getSelection().container;
			} else {
				return undefined;
			}
		},
		setSelection: function(elStart, elEnd, start, end){
			var range = rangy.createRange();

			range.setStart(elStart, start);
			range.setEnd(elEnd, end);

			rangy.getSelection().setSingleRange(range);
		},
		setSelectionBeforeElement: function (el){
			var range = rangy.createRange();

			range.selectNode(el);
			range.collapse(true);

			rangy.getSelection().setSingleRange(range);
		},
		setSelectionAfterElement: function (el){
			var range = rangy.createRange();

			range.selectNode(el);
			range.collapse(false);

			rangy.getSelection().setSingleRange(range);
		},
		setSelectionToElementStart: function (el){
			var range = rangy.createRange();

			range.selectNodeContents(el);
			range.collapse(true);

			rangy.getSelection().setSingleRange(range);
		},
		setSelectionToElementEnd: function (el){
			var range = rangy.createRange();

			range.selectNodeContents(el);
			range.collapse(false);
			if(el.childNodes && el.childNodes[el.childNodes.length - 1] && el.childNodes[el.childNodes.length - 1].nodeName === 'br'){
				range.startOffset = range.endOffset = range.startOffset - 1;
			}
			rangy.getSelection().setSingleRange(range);
		},
		setStateShiftKey: function(bS) {
			bShiftState = bS;
		},
		getStateShiftKey: function() {
			return bShiftState;
		},
		// from http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
		// topNode is the contenteditable normally, all manipulation MUST be inside this.
		insertHtml: function(html, topNode){
			var parent, secondParent, _childI, nodes, i, lastNode, _tempFrag;
			var element = angular.element("<div>" + html + "</div>");
			var range = rangy.getSelection().getRangeAt(0);
			var frag = _document.createDocumentFragment();
			var children = element[0].childNodes;
			var isInline = true;

			if(children.length > 0){
				// NOTE!! We need to do the following:
				// check for blockelements - if they exist then we have to split the current element in half (and all others up to the closest block element) and insert all children in-between.
				// If there are no block elements, or there is a mixture we need to create textNodes for the non wrapped text (we don't want them spans messing up the picture).
				nodes = [];
				for(_childI = 0; _childI < children.length; _childI++){
					var _cnode = children[_childI];
					if (_cnode.nodeName.toLowerCase() === 'p' &&
						_cnode.innerHTML.trim() === '') { // empty p element
						continue;
					}
					/****************
					 *  allow any text to be inserted...
					if((   _cnode.nodeType === 3 &&
						   _cnode.nodeValue === '\ufeff'[0] &&
						   _cnode.nodeValue.trim() === '') // empty no-space space element
						) {
						// no change to isInline
						nodes.push(_cnode);
						continue;
					}
					if(_cnode.nodeType === 3 &&
						 _cnode.nodeValue.trim() === '') { // empty text node
						continue;
					}
					*****************/
					isInline = isInline && !BLOCKELEMENTS.test(_cnode.nodeName);
					nodes.push(_cnode);
				}
				for(var _n = 0; _n < nodes.length; _n++) {
					lastNode = frag.appendChild(nodes[_n]);
				}
				if( !isInline &&
					range.collapsed &&
					/^(|<br(|\/)>)$/i.test(range.startContainer.innerHTML) ) {
					range.selectNode(range.startContainer);
				}
			}else{
				isInline = true;
				// paste text of some sort
				lastNode = frag = _document.createTextNode(html);
			}

			// Other Edge case - selected data spans multiple blocks.
			if(isInline){
				range.deleteContents();
			}else{ // not inline insert
				if(range.collapsed && range.startContainer !== topNode){
					if(range.startContainer.innerHTML && range.startContainer.innerHTML.match(/^<[^>]*>$/i)){
						// this log is to catch when innerHTML is something like `<img ...>`
						parent = range.startContainer;
						if(range.startOffset === 1){
							// before single tag
							range.setStartAfter(parent);
							range.setEndAfter(parent);
						}else{
							// after single tag
							range.setStartBefore(parent);
							range.setEndBefore(parent);
						}
					}else{
						// split element into 2 and insert block element in middle
						if(range.startContainer.nodeType === 3 && range.startContainer.parentNode !== topNode){ // if text node
							parent = range.startContainer.parentNode;
							secondParent = parent.cloneNode();
							// split the nodes into two lists - before and after, splitting the node with the selection into 2 text nodes.
							taDOM.splitNodes(parent.childNodes, parent, secondParent, range.startContainer, range.startOffset);

							// Escape out of the inline tags like b
							while(!VALIDELEMENTS.test(parent.nodeName)){
								angular.element(parent).after(secondParent);
								parent = parent.parentNode;
								var _lastSecondParent = secondParent;
								secondParent = parent.cloneNode();
								// split the nodes into two lists - before and after, splitting the node with the selection into 2 text nodes.
								taDOM.splitNodes(parent.childNodes, parent, secondParent, _lastSecondParent);
							}
						}else{
							parent = range.startContainer;
							secondParent = parent.cloneNode();
							taDOM.splitNodes(parent.childNodes, parent, secondParent, undefined, undefined, range.startOffset);
						}

						angular.element(parent).after(secondParent);
						// put cursor to end of inserted content
						//console.log('setStartAfter', parent);
						range.setStartAfter(parent);
						range.setEndAfter(parent);

						if(/^(|<br(|\/)>)$/i.test(parent.innerHTML.trim())){
							range.setStartBefore(parent);
							range.setEndBefore(parent);
							angular.element(parent).remove();
						}
						if(/^(|<br(|\/)>)$/i.test(secondParent.innerHTML.trim())) angular.element(secondParent).remove();
						if(parent.nodeName.toLowerCase() === 'li'){
							_tempFrag = _document.createDocumentFragment();
							for(i = 0; i < frag.childNodes.length; i++){
								element = angular.element('<li>');
								taDOM.transferChildNodes(frag.childNodes[i], element[0]);
								taDOM.transferNodeAttributes(frag.childNodes[i], element[0]);
								_tempFrag.appendChild(element[0]);
							}
							frag = _tempFrag;
							if(lastNode){
								lastNode = frag.childNodes[frag.childNodes.length - 1];
								lastNode = lastNode.childNodes[lastNode.childNodes.length - 1];
							}
						}
					}
				}else{
					range.deleteContents();
				}
			}

			range.insertNode(frag);
			if(lastNode){
				api.setSelectionToElementEnd(lastNode);
			}
		}

		/* NOT FUNCTIONAL YET
		 // under Firefox, we may have a selection that needs to be normalized
		 isSelectionContainerWhole_taTextElement: function (){
		 var range = rangy.getSelection().getRangeAt(0);
		 var container = range.commonAncestorContainer;
		 if (container.nodeName.toLowerCase() === 'div' &&
		 /^taTextElement/.test(container.id)) {
		 // container is the whole taTextElement
		 return true;
		 }
		 return false;
		 },
		 setNormalizedSelection: function (){
		 var range = rangy.getSelection().getRangeAt(0);
		 var container = range.commonAncestorContainer;
		 console.log(range);
		 console.log(container.childNodes);
		 if (range.collapsed) {
		 // we know what to do...
		 console.log(container.childNodes[range.startOffset]);
		 api.setSelectionToElementStart(container.childNodes[range.startOffset]);
		 }
		 },
		 */
	};
	return api;
}]).service('taDOM', function(){
	var taDOM = {
		// recursive function that returns an array of angular.elements that have the passed attribute set on them
		getByAttribute: function(element, attribute){
			var resultingElements = [];
			var childNodes = element.children();
			if(childNodes.length){
				angular.forEach(childNodes, function(child){
					resultingElements = resultingElements.concat(taDOM.getByAttribute(angular.element(child), attribute));
				});
			}
			if(element.attr(attribute) !== undefined) resultingElements.push(element);
			return resultingElements;
		},

		transferChildNodes: function(source, target){
			// clear out target
			target.innerHTML = '';
			while(source.childNodes.length > 0) target.appendChild(source.childNodes[0]);
			return target;
		},

		splitNodes: function(nodes, target1, target2, splitNode, subSplitIndex, splitIndex){
			if(!splitNode && isNaN(splitIndex)) throw new Error('taDOM.splitNodes requires a splitNode or splitIndex');
			var startNodes = document.createDocumentFragment();
			var endNodes = document.createDocumentFragment();
			var index = 0;

			while(nodes.length > 0 && (isNaN(splitIndex) || splitIndex !== index) && nodes[0] !== splitNode){
				startNodes.appendChild(nodes[0]); // this removes from the nodes array (if proper childNodes object.
				index++;
			}

			if(!isNaN(subSplitIndex) && subSplitIndex >= 0 && nodes[0]){
				startNodes.appendChild(document.createTextNode(nodes[0].nodeValue.substring(0, subSplitIndex)));
				nodes[0].nodeValue = nodes[0].nodeValue.substring(subSplitIndex);
			}
			while(nodes.length > 0) endNodes.appendChild(nodes[0]);

			taDOM.transferChildNodes(startNodes, target1);
			taDOM.transferChildNodes(endNodes, target2);
		},

		transferNodeAttributes: function(source, target){
			for(var i = 0; i < source.attributes.length; i++) target.setAttribute(source.attributes[i].name, source.attributes[i].value);
			return target;
		}
	};
	return taDOM;
});
