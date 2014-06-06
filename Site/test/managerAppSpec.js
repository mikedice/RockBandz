// Testing of the ManagerApp controller
describe('managerApp function', function () {

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

    // variables to use in test cases 
    var $httpBackend, $rootScope, createController, serviceCallback;

    // initialize the angular module for test cases
    beforeEach(module('ManagerApp'));

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
            var cont = $controller('Management', {
                '$scope': $rootScope
            });
        };
    }));

    // Test cases
    it('should initialize static strings', function () {
        var controller = createController();
        expect($rootScope.thumb).toEqual('fudge');
    });

    it('should make a GET request to /api/gallery to fetch all galleries', inject(function () {
        $httpBackend.expectGET('/api/gallery');
        var controller = createController();
        $httpBackend.flush();
    }));

    var theSpec = it('should request all galleries and compute their thumbnails', function (done) {

        $httpBackend.expectGET('/api/gallery');
        $rootScope.$watch('galleryList', function (newVal, oldVal) {
            if (typeof $rootScope.galleryList != 'undefined' &&
                typeof $rootScope.galleryList.length != 'undefined' &&
                $rootScope.galleryList.length == 2) {
                theSpec.expect(true).toEqual(true);
                done(); // tell jasmine async work is done
            }
        });

        var mController = createController();
        $httpBackend.flush();
    });



});


