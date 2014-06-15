(function (module) {
    module.service('fileReaderSvc', function ($q) {
        this.readDataUrl = function (file) {
            var defer = $q.defer();

            var reader = new window.FileReader();
            reader.onload = function (e) {
                defer.resolve(e.target.result);
            };

            reader.onerror = function (msg) {
                console.log(msg);
            };

            reader.readAsDataURL(file);
            return defer.promise;
        }
    });
})(angular.module('FileReaderServiceModule', []));
