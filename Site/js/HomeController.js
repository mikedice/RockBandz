(function (app) {
    app.controller('HomeController', ['$scope', '$http', '$window', '$log',
    function ($scope, $http, $window, $log) {

        mScope = $scope;
        mLogService = $log;
        mHttpService = $http;
        mWindowService = $window;
        
        mScope.SetGallery = function (index) {
            mScope.CurrentGallery = mScope.GalleryList[index];
        }

        initializeGalleries();
        $scope.$watch('$viewContentLoaded', function () {
            var l = document.getElementById('links');
            document.getElementById('links').onclick = function (event) {
                event = event || window.event;
                var target = event.target || event.srcElement,
                    link = target.src ? target.parentNode : target,
                    options = { index: link, event: event },
                    links = this.getElementsByTagName('a');
                blueimp.Gallery(links, options);
            };
        });
    }]);

    var initializeGalleries = function () {
        var imagesToProcess = [];

        mHttpService.get("/api/gallery")
            .success(function (galleries) {
                mScope.GalleryList = galleries;
                mScope.CurrentGallery = mScope.GalleryList[0];

            });
    };

})(angular.module('InTheFrontRowModule'));