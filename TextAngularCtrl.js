var app = angular.module('textAngularTestingApp', ['textAngular']);

app.controller('textAngularTestingCtrl', ['$scope', function ($scope) {
    $scope.ctrlName = 'textAngularTestingCtrl';
    $scope.editorContent = 'original text in editor';
}]);