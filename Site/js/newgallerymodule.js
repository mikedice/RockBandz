angular.module('NewGalleryApp', ['angularFileUpload', 'ThumbnailServiceModule', 'ui.tinymce'])
    .controller('NewGalleryController', [
        '$scope', '$http', '$log', '$upload','thumbnailSvc',
        InTheFrontRow.Management.NewGalleryController.ControllerFunction]);