angular.module('NewGalleryApp', ['angularFileUpload', 'ThumbnailServiceModule'])
    .controller('NewGalleryController', [
        '$scope', '$http', '$log', '$upload','thumbnailSvc',
        InTheFrontRow.Management.NewGalleryController.ControllerFunction]);