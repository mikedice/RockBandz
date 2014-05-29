var app = angular.module('NewGalleryApp', []);
app.controller('NewGalleryController', function ($scope, $http, $log) {
    $scope.galleryTitle = "";
    $scope.uploadUrlRoot = "api/gallery/";
    $scope.readyForUpload = false;
    $scope.galleryId = null;

    // Configuring the dropzone
    Dropzone.options.uploadFilesForm =
        {
            url: $scope.uploadUrlRoot,

            // Configuraiton of dropzone event handlers.
            init: function () {
                this.on("removedfile", function (file) {
                    $http.delete('api/gallery/' + $scope.galleryId + '?file=' + file.name)
                        .success(function (data) { })
                        .error(function (data) { window.alert(data.error);})
                });
            }
        };
    
    // Before we allow an upload we create a gallery and get the new gallery's ID.
    $http.post('api/gallery').
        success(function (data) {
            // Save the gallery ID
            $scope.galleryId = data.GalleryId;

            // Update Dropzone to use the right URL;
            for (i = 0; i < Dropzone.instances.length; i++) {
                Dropzone.instances[i].options.url = $scope.uploadUrlRoot + data.GalleryId;
            }
            $scope.readyForUpload = true;
        }).error(function (data) {
            window.alert(data.error);
        })

});

