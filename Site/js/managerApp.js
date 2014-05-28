var app = angular.module('ManagerApp', ['ui.bootstrap']);
app.controller('Management', function ($scope, $modal, $log) {
    $scope.galleryTitle = "";
    $scope.uploadUrlRoot = "api/images?galleryName=";
    Dropzone.prototype.defaultOptions.url = $scope.uploadUrlRoot;

});

