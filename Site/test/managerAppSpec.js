// Testing of the ManagerApp controller
describe('managerApp function', function () {
    // variables to use in test cases 
    var $httpBackend, $rootScope, createController;

    // initialize the module for test cases
    beforeEach(module('ManagerApp'));

    // initialization of httpBackend service and controller
    beforeEach(inject(function ($injector) {
        // Set up the mock http service responses (see angular-mock.js)
        $httpBackend = $injector.get('$httpBackend');

        // backend definition common for all tests
        $httpBackend.when('GET', '/api/gallery').respond({});

        // Get hold of a scope (i.e. the root scope), needed to create our controller
        $rootScope = $injector.get('$rootScope');

        // Get hold of a $controller, used to create controllers
        var $controller = $injector.get('$controller');

        // function used in test cases to get a controller object
        createController = function () {
            return $controller('Management', { '$scope': $rootScope });
        };
    }));

    // Test cases
    it('should initialize static strings', function () {
        var controller = createController();
        expect($rootScope.thumb).toEqual('fudge');
    });

    it('should make a GET request to /api/gallery to fetch all galleries', inject(function ($rootScope, $controller) {
        $httpBackend.expectGET('/api/gallery');
        var controller = createController();
        $httpBackend.flush();
    }));

});


