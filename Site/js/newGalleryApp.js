var app = angular.module('NewGalleryApp', []);
app.controller('NewGalleryController', function ($scope, $http, $log) {
    $scope.galleryTitle = "";
    $scope.uploadUrlRoot = "api/gallery?galleryUUID=";
    $scope.readyForUpload = false;
    //Dropzone.prototype.defaultOptions.url = $scope.uploadUrlRoot;
    $scope.readyForUpload = true;
    //$http.get('api/images/NewGallery').
    //    success(function (data) {
    //        //for (i = 0; i < Dropzone.instances.length; i++) {
    //        //    Dropzone.instances[i].options.url = $scope.uploadUrlRoot + data;
    //            $scope.readyForUpload = true;
    //        //}
    //    }).error(function (data) {
    //        window.alert(data.error);
    //    })

});

