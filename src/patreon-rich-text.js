angular.module('PatreonRichText', [])
	.factory('PatreonRichText', ['$timeout', '$document', '$window', function($timeout, $document, $window) {
		'ngInject';

		/*eslint-disable */

		function placeTooltipAtCoordinates(x, y, callback) {
			var _offsetX = 24,
			_offsetY = 60;

			return $timeout(function(){
				Array.prototype.forEach.call(
					document.getElementsByClassName('ta-toolbar'),
					function(node) {
						node.style.left = String(x - _offsetX) + 'px';
						node.style.top = String(y - _offsetY) + 'px';
					}
				);

				if (callback) {
					return callback();
				}
			});
		}

		function getTextRectangles(selection){
			var range = selection.getRangeAt(0),
			rectangles = null;

			rectangles = range.getClientRects();

			return rectangles;
		}

		var PatreonRichText = {};

		PatreonRichText.customTextAreaElement = "<textarea class='post-creation-textarea' id='post-creation-textarea'></textarea>";

		PatreonRichText.customToolbarElement = '<div class="ta-link-toolbar"></div>';

		PatreonRichText.setUpIcon = function(iconClass){
			return angular.element("<i data-patreon-icon='" + iconClass + "'>");
		};

		PatreonRichText.showPopover = function(scope){
			scope.displayElements.popover.addClass('active');
		};

		PatreonRichText.hidePopover = function(scope){
			scope.displayElements.popover.removeClass('active');
		};

		PatreonRichText.hideToolbarPopover = function(){
			return placeTooltipAtCoordinates(-9999, -9999);
		};

		PatreonRichText.handleSelected = function(scope, focussedCallback){
			var selection = $window.getSelection();
			var currentlySelected = selection.type ? selection.type === "Range" : !selection.isCollapsed; // FF compatibility
			var popoverIsActive = scope.displayElements.popover.hasClass('active');
			var popoverInputIsActive = Array.prototype.some.call(
				scope.displayElements.popover[0].querySelectorAll('.patreon-input'),
				function(node) { return node === $document.activeElement; }
			);
			if (currentlySelected && !popoverIsActive) {
				var rectangles = getTextRectangles($window.getSelection());
				if (rectangles[0] && rectangles[0].left && rectangles[0].top) {
					focussedCallback(true);

					return placeTooltipAtCoordinates( rectangles[0].left, rectangles[0].top);
				} else {
					return this.hideToolbarPopover();
				}
			} else if (!currentlySelected && popoverIsActive && !popoverInputIsActive) {
				return this.hideToolbarPopover();
			} else {
				return this.hideToolbarPopover();
			}

			return false;
		};

		PatreonRichText.handleSelectedOnMouseUp = function(){
			$timeout(this.handleSelected);
		};

		PatreonRichText.scrollEventForRemovingTooltips = function(scope){
			PatreonRichText.hideToolbarPopover(scope);

			return $timeout(angular.noop);
		};

		/*eslint-enable */

		return PatreonRichText;
	}]);
