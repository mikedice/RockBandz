describe("Test the thumbnailSvc service", function()
{
    var testImage;
    var thumbnailService;

    // inject the service module
    beforeEach(module('ThumbnailServiceModule'));

    // inject the thumbnailService
    beforeEach(inject(function (_thumbnailSvc_) {
        thumbnailService = _thumbnailSvc_;
    }));

    // create an img tag that loads a test image
    beforeEach(function () {
        testImage = angular.element("<img>");
    });

    it("should resize image and create thumbnail data", function (done) {

        // bind to the load event so creation of thumbnail can be tested
        testImage.bind('load', function (el) {
            var options = thumbnailService.resize(el.target);
            var thumb = thumbnailService.createThumb(options, el.target);

            // options and thumbnail were created successfully
            expect(options.optHeight).toEqual(100);
            expect(options.optHeight).toEqual(100);
            expect(thumb).toMatch("^data");

            // async is done.
            done();
        });

        // kick off async by loading image
        testImage[0].src = "/test/test-images/DSC_7728.jpg";
    });
});