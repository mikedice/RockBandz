var app = angular.module('ManagerApp', []);
app.controller('Management', function ($scope) {
    $scope.galleryTitle = "";
    $scope.uploadUrlRoot = "api/images?galleryName=";

    $scope.$watch('galleryTitle', function (value) {
        Dropzone.instances[0].options.url = $scope.uploadUrlRoot + value;
    });

    var myDropzone = document.querySelectorAll(".my-dropzone")

    Dropzone.instances[0].options.url = $scope.uploadUrlRoot + value;
});