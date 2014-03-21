describe('taMaxText', function(){
	'use strict';
	var $rootScope, $compile;
	beforeEach(module('textAngular'));
	beforeEach(inject(function (_$compile_, _$rootScope_) {
		$rootScope = _$rootScope_;
		$compile = _$compile_;
	}));

	it('should fail without ngmodel', function(){
		expect(function () {
			$compile('<div ta-max-text></div>')($rootScope);
			$rootScope.$digest();
		}).toThrow();
	});

	it('should fail without a value', function(){
		expect(function () {
			$compile('<div ng-model="test" ta-max-text></div>')($rootScope);
			$rootScope.$digest();
		}).toThrow('Max text must be an integer');
	});

	it('should fail without a numeric value', function(){
		expect(function () {
			$compile('<div ng-model="test" ta-max-text="worldspawn"></div>')($rootScope);
			$rootScope.$digest();
		}).toThrow('Max text must be an integer');
	});

	it('should fail when text exceeds limit', function(){
		var $scope = $rootScope.$new();
		var form = angular.element('<form name="form"><input type="text" ng-model="model.html" ta-max-text="11" name="html" /></form>');
		$scope.model = { html : null };
		$compile(form)($scope);
		$scope.$digest();
		$scope.form.html.$setViewValue('<strong>textAngular_</strong>');

		expect($scope.form.html.$error.taMaxText).toBe(true);
	});

	it('should pass when text is within limit', function(){
		var $scope = $rootScope.$new();
		var form = angular.element('<form name="form"><input type="text" ng-model="model.html" ta-max-text="11" name="html" /></form>');
		$scope.model = { html : null };
		$compile(form)($scope);
		$scope.$digest();
		$scope.form.html.$setViewValue('<strong>textAngular</strong>');

		expect($scope.form.html.$error.taMaxText).toBe(false);
	});
});