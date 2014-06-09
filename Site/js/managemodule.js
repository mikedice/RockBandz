angular.module('ManagerApp', ['ThumbnailServiceModule'])
    .controller('Management', [
        '$scope', '$http', '$window', '$log', 'thumbnailSvc',
            InTheFrontRow.Management.ManagementController.ControllerFunction]);



