var app = angular.module('ManagerApp', []);
app.controller('Management', function ($scope, $http) {
    $scope.galleryList = null;

    $scope.NewGallery = function () {
        window.location = "/newgallery.html";
    }

    $http.get("/api/gallery")
        .success(function (data) {
            $scope.galleryList = data;
        })
        .error(function (data) {
            window.alert(data.error);
        })
});

