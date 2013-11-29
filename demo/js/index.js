(function() {
  var wysiwygeditor;

  angular.module("textAngularTest", ['textAngular']);

  wysiwygeditor = function($scope) {
    return $scope.htmlcontent = '<p>Hello World!</p>';
  };

  this.wysiwygeditor = wysiwygeditor;

}).call(this);
