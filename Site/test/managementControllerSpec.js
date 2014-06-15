// Based on plunker
// http://plnkr.co/edit/zdqy6yCYrv2sDhzYV3az?p=preview

describe('test the ManagementController controller', function () {
    // variables to use in test cases 
    var $httpBackend, $rootScope, createController;
    // Fake response to http GET /api/gallery
    var fakeGalleryResponses = [
        {
            "Metadata":
            {
                "Title": "Test gallery 1",
                "Description": "Test gallery 1 description",
                "Id": "11112222-89a6-4e1c-a91d-4c1e818b9e3b"
            }, "ImageUrls": ["/test/test-images/DSC_7728.jpg", "/test/test-images/DSC_7852.jpg"]
        },
        {
            "Metadata":
            {
                "Title": "Test gallery 2",
                "Description": "Test gallery 2 description",
                "Id": "33334444-89a6-4e1c-a91d-4c1e818b9e3b"
            }, "ImageUrls": ["/test/test-images/DSC_7899.jpg"]
        }
    ];

    beforeEach(module('InTheFrontRowModule'));

    // initialization of angular $httpBackend service and the 'Management' 
    // controller before each test case
    beforeEach(inject(function ($injector) {
        // Set up the mock http service responses (see angular-mock.js)
        $httpBackend = $injector.get('$httpBackend');

        // backend definition common for all tests
        $httpBackend.when('GET', '/api/gallery').respond(fakeGalleryResponses);

        // Get hold of a scope (i.e. the root scope), needed to create our controller
        $rootScope = $injector.get('$rootScope');

        // Get hold of a $controller, used to create controllers
        var $controller = $injector.get('$controller');

        // function used in test cases to get a controller object
        createController = function () {
            var cont = $controller('ManagementController', {
                '$scope': $rootScope
            });
        };
    }));

    it('should request all galleries and compute their thumbnails', function (done) {
        $httpBackend.expectGET('/api/gallery');

        // Test that the HTTP request completed and that the async processing of the async data
        // has also completed
        $rootScope.$watch('galleryList', function (newVal, oldVal) {
            console.log("watcher was notified. ImageLoaded:" + $rootScope.galleryList);
            if (typeof $rootScope.galleryList != 'undefined' &&
                $rootScope.galleryList !== null &&
                $rootScope.galleryList.length !== 'undefined' &&
                $rootScope.galleryList.length == 2) {

                expect($rootScope.galleryList[0].ImageUrls.length).toEqual(2);
                expect($rootScope.galleryList[0].Thumbnails.length).toEqual(2);
                expect($rootScope.galleryList[1].ImageUrls.length).toEqual(1);
                expect($rootScope.galleryList[1].Thumbnails.length).toEqual(1);

                done(); // tell jasmine async work is done
            }

        });

        var mController = createController();
        $httpBackend.flush();
    });
});


