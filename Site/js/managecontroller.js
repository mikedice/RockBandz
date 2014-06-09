
var InTheFrontRow = InTheFrontRow || {};
InTheFrontRow.Management = InTheFrontRow.Management || {};
InTheFrontRow.Management.ManagementController = (function (mySelf) {

    // instance variables
    var mLogService;
    var mHttpService;
    var mWindowService;
    var mScope;
    var mThumbnailService;

    // The controller function
    mySelf.ControllerFunction = function (scope, httpService, windowService, logService, thumbnailService) {

        // Initialize controller private variables
        mScope = scope;
        mLogService = logService;
        mHttpService = httpService;
        mWindowService = windowService;
        mThumbnailService = thumbnailService;

        // Initialize angular scope variables
        mScope.thumb = "fudge";
        mScope.NewGallery = function () {
            mWindowService.location = "/newgallery.html";
        }

        // async initialization of the controller
        initializeGalleries();
    }

// private helpers
    var initializeGalleries = function () {
        var imagesToProcess = [];

        mHttpService.get("/api/gallery").success(function (galleries) {
            for (var i = 0; i < galleries.length; i++) {
                // Add a Thumbnails property to hold the thumbnails we compute
                galleries[i].Thumbnails = [];

                for (var p = 0; p < galleries[i].ImageUrls.length; p++) {
                    imagesToProcess.push({
                        imageUrl: galleries[i].ImageUrls[p],
                        gallery: galleries[i]
                    });
                }
            }

            // Made a list of all the images to process now kick off that processing.
            // The processing of the images is async work. We get called back each time an image
            // is processed. We need to keep track of how many images were processed so that
            // when the last one is processed we can apply the gallery list to the scope.
            var totalImages = imagesToProcess.length;
            var totalProcessed = 0;

            processImages(imagesToProcess, function() {
                totalProcessed++;
                if (totalProcessed >= totalImages) {
                    console.log("inside callback, all images processed");
                    mScope.$apply(function() {
                        mScope.galleryList = galleries;
                    });
                }
            });
        });

    }

    var processImages = function (imageList, completedCallback) {
        // imageTags will store state for when the async work is completed
        var imageTags = {};

        for (var i = 0; i < imageList.length; i++) {
            var img = document.createElement("img");

            // tag the img tag with a unique ID then associate the gallery with the img tag keyed by the 
            // img tag's unique ID. This way, given the img tag we can find the right gallery to store the
            // thumbnail on when the async computation is competed
            img.id = "_tempilist" + i;
            imageTags[img.id] = imageList[i];

            img.addEventListener('load', function(arg) {
                console.log("image was loaded: " + arg.target.src);
                console.log("image tag with id was processed " + arg.target.id);

                // compute the thumbnail...
                var gallery = imageTags[arg.target.id].gallery;
                var options = mThumbnailService.resize(arg.target);
                var thumbData = mThumbnailService.createThumb(options, arg.target);

                // ...and store it on the gallery
                gallery.Thumbnails.push({
                    orginalUrl: arg.target.src,
                    thumbnail: thumbData
                });
                console.log("gallery now has this many thumbnails: " + gallery.Thumbnails.length);

                // invoke completed callback, which will decide if all images are processed.
                completedCallback();
            }, false);

            console.log("will load image: " + imageList[i].imageUrl);
            img.src = imageList[i].imageUrl;
        }
    }


    return mySelf;
})(InTheFrontRow.Management.ManagementController || {});



