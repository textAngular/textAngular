angular.module('textAngular.validators', [])
.directive('taMaxText', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl){
			var max = parseInt(scope.$eval(attrs.taMaxText));
			if (isNaN(max)){
				throw('Max text must be an integer');
			}
			attrs.$observe('taMaxText', function(value){
				max = parseInt(value);
				if (isNaN(max)){
					throw('Max text must be an integer');
				}
				if (ctrl.$dirty){
					ctrl.$setViewValue(ctrl.$viewValue);
				}
			});
			function validator (viewValue){
				var source = angular.element('<div/>');
				source.html(viewValue);
				var length = source.text().length;
				if (length <= max){
					ctrl.$setValidity('taMaxText', true);
					return viewValue;
				}
				else{
					ctrl.$setValidity('taMaxText', false);
					return undefined;
				}
			}
			ctrl.$parsers.unshift(validator);
		}
	};
}).directive('taMinText', function(){
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl){
			var min = parseInt(scope.$eval(attrs.taMinText));
			if (isNaN(min)){
				throw('Min text must be an integer');
			}
			attrs.$observe('taMinText', function(value){
				min = parseInt(value);
				if (isNaN(min)){
					throw('Min text must be an integer');
				}
				if (ctrl.$dirty){
					ctrl.$setViewValue(ctrl.$viewValue);
				}
			});
			function validator (viewValue){
				var source = angular.element('<div/>');
				source.html(viewValue);
				var length = source.text().length;
				if (!length || length >= min){
					ctrl.$setValidity('taMinText', true);
					return viewValue;
				}
				else{
					ctrl.$setValidity('taMinText', false);
					return undefined;
				}
			}
			ctrl.$parsers.unshift(validator);
		}
	};
});