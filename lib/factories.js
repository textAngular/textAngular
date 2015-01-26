angular.module('textAngular.factories', [])
.factory('taBrowserTag', [function(){
	return function(tag){
		/* istanbul ignore next: ie specific test */
		if(!tag) return (_browserDetect.ie <= 8)? 'P' : 'p';
		else if(tag === '') return (_browserDetect.ie === undefined)? 'div' : (_browserDetect.ie <= 8)? 'P' : 'p';
		else return (_browserDetect.ie <= 8)? tag.toUpperCase() : tag;
	};
}]).factory('taApplyCustomRenderers', ['taCustomRenderers', function(taCustomRenderers){
	return function(val){
		var element = angular.element('<div></div>');
		element[0].innerHTML = val;

		angular.forEach(taCustomRenderers, function(renderer){
			var elements = [];
			// get elements based on what is defined. If both defined do secondary filter in the forEach after using selector string
			if(renderer.selector && renderer.selector !== '')
				elements = element.find(renderer.selector);
			/* istanbul ignore else: shouldn't fire, if it does we're ignoring everything */
			else if(renderer.customAttribute && renderer.customAttribute !== '')
				elements = getByAttribute(element, renderer.customAttribute);
			// process elements if any found
			angular.forEach(elements, function(_element){
				_element = angular.element(_element);
				if(renderer.selector && renderer.selector !== '' && renderer.customAttribute && renderer.customAttribute !== ''){
					if(_element.attr(renderer.customAttribute) !== undefined) renderer.renderLogic(_element);
				} else renderer.renderLogic(_element);
			});
		});

		return element[0].innerHTML;
	};
}]).factory('taFixChrome', function(){
	// get whaterever rubbish is inserted in chrome
	// should be passed an html string, returns an html string
	var taFixChrome = function(html){
		// default wrapper is a span so find all of them
		var $html = angular.element('<div>' + html + '</div>');
		var spans = angular.element($html).find('span');
		for(var s = 0; s < spans.length; s++){
			var span = angular.element(spans[s]);
			// chrome specific string that gets inserted into the style attribute, other parts may vary. Second part is specific ONLY to hitting backspace in Headers
			if(span.attr('style') && span.attr('style').match(/line-height: 1.428571429;|color: inherit; line-height: 1.1;/i)){
				span.attr('style', span.attr('style').replace(/( |)font-family: inherit;|( |)line-height: 1.428571429;|( |)line-height:1.1;|( |)color: inherit;/ig, ''));
				if(!span.attr('style') || span.attr('style') === ''){
					if(span.next().length > 0 && span.next()[0].tagName === 'BR') span.next().remove();
					span.replaceWith(span[0].innerHTML);
				}
			}
		}
		// regex to replace ONLY offending styles - these can be inserted into various other tags on delete
		var result = $html[0].innerHTML.replace(/style="[^"]*?(line-height: 1.428571429;|color: inherit; line-height: 1.1;)[^"]*"/ig, '');
		// only replace when something has changed, else we get focus problems on inserting lists
		if(result !== $html[0].innerHTML) $html[0].innerHTML = result;
		return $html[0].innerHTML;
	};
	return taFixChrome;
}).factory('taSanitize', ['$sanitize', function taSanitizeFactory($sanitize){

	var convert_infos = [
		{
			property: 'font-weight',
			values: [ 'bold' ],
			tag: 'b'
		},
		{
			property: 'font-style',
			values: [ 'italic' ],
			tag: 'i'
		}
	];

	function fixChildren( jq_elm ) {
		var children = jq_elm.children();
		if ( !children.length ) {
			return;
		}
		angular.forEach( children, function( child ) {
			var jq_child = angular.element(child);
			fixElement( jq_child );
			fixChildren( jq_child );
		});
	}

	function fixElement( jq_elm ) {
		var styleString = jq_elm.attr('style');
		if ( !styleString ) {
			return;
		}
		angular.forEach( convert_infos, function( convert_info ) {
			var css_key = convert_info.property;
			var css_value = jq_elm.css(css_key);
			if ( convert_info.values.indexOf(css_value) >= 0 && styleString.toLowerCase().indexOf(css_key) >= 0 ) {
				jq_elm.css( css_key, '' );
				var inner_html = jq_elm.html();
				var tag = convert_info.tag;
				inner_html = '<'+tag+'>' + inner_html + '</'+tag+'>';
				jq_elm.html( inner_html );
			}
		});
	}

	return function taSanitize(unsafe, oldsafe, ignore){

		if ( !ignore ) {
			try {
				var jq_container = angular.element('<div>' + unsafe + '</div>');
				fixElement( jq_container );
				fixChildren( jq_container );
				unsafe = jq_container.html();
			} catch (e) {
			}
		}

		// unsafe and oldsafe should be valid HTML strings
		// any exceptions (lets say, color for example) should be made here but with great care
		// setup unsafe element for modification
		var unsafeElement = angular.element('<div>' + unsafe + '</div>');
		// replace all align='...' tags with text-align attributes
		angular.forEach(getByAttribute(unsafeElement, 'align'), function(element){
			element.css('text-align', element.attr('align'));
			element.removeAttr('align');
		});

		// get the html string back
		var safe;
		unsafe = unsafeElement[0].innerHTML;
		try {
			safe = $sanitize(unsafe);
			// do this afterwards, then the $sanitizer should still throw for bad markup
			if(ignore) safe = unsafe;
		} catch (e){
			safe = oldsafe || '';
		}
		
		// Do processing for <pre> tags, removing tabs and return carriages outside of them
		
		var _preTags = safe.match(/(<pre[^>]*>.*?<\/pre[^>]*>)/ig);
		processedSafe = safe.replace(/(&#(9|10);)*/ig, '');
		var re = /<pre[^>]*>.*?<\/pre[^>]*>/ig;
		var index = 0;
		var lastIndex = 0;
		var origTag;
		safe = '';
		while((origTag = re.exec(processedSafe)) !== null && index < _preTags.length){
			safe += processedSafe.substring(lastIndex, origTag.index) + _preTags[index];
			lastIndex = origTag.index + origTag[0].length;
			index++;
		}
		return safe + processedSafe.substring(lastIndex);
	};
}]).factory('taToolExecuteAction', ['$q', '$log', function($q, $log){
	// this must be called on a toolScope or instance
	return function(editor){
		if(editor !== undefined) this.$editor = function(){ return editor; };
		var deferred = $q.defer(),
			promise = deferred.promise,
			_editor = this.$editor();
		promise['finally'](function(){
			_editor.endAction.call(_editor);
		});
		// pass into the action the deferred function and also the function to reload the current selection if rangy available
		var result;
		try{
			result = this.action(deferred, _editor.startAction());
		}catch(exc){
			$log.error(exc);
		}
		if(result || result === undefined){
			// if true or undefined is returned then the action has finished. Otherwise the deferred action will be resolved manually.
			deferred.resolve();
		}
	};
}]);