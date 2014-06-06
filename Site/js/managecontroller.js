
var InTheFrontRow = InTheFrontRow || {};
InTheFrontRow.Management = InTheFrontRow.Management || {};
InTheFrontRow.Management.ManagementController = (function () {
    var mySelf = {};

    // instance variables
    var mLogService;
    var mHttpService;
    var mWindowService;
    var mScope;

    // The controller function
    mySelf.ControllerFunction = function (scope, httpService, windowService, logService) {

        // Initialize controller private variables
        mScope = scope;
        mLogService = logService;
        mHttpService = httpService;
        mWindowService = windowService;

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
                var options = resize(arg.target);
                var thumbData = createThumb(options, arg.target);

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

    // helpers borrowed from dropzone
    var resize = function (img) {
        var info, srcRatio, trgRatio;
        info = {
            srcX: 0,
            srcY: 0,
            srcWidth: img.width,
            srcHeight: img.height
        };
        srcRatio = img.width / img.height;
        info.optWidth = 100;
        info.optHeight = 100;
        if (!((info.optWidth != null) && (info.optHeigh != null))) {
            if ((info.optWidth == null) && (info.optHeight == null)) {
                info.optWidth = info.srcWidth;
                info.optHeight = info.srcHeight;
            } else if (info.optWidth == null) {
                info.optWidth = srcRatio * info.optHeight;
            } else if (info.optHeight == null) {
                info.optHeight = (1 / srcRatio) * info.optWidth;
            }
        }
        trgRatio = info.optWidth / info.optHeight;
        if (img.height < info.optHeight || img.width < info.optWidth) {
            info.trgHeight = info.srcHeight;
            info.trgWidth = info.srcWidth;
        } else {
            if (srcRatio > trgRatio) {
                info.srcHeight = img.height;
                info.srcWidth = info.srcHeight * trgRatio;
            } else {
                info.srcWidth = img.width;
                info.srcHeight = info.srcWidth / trgRatio;
            }
        }
        info.srcX = (img.width - info.srcWidth) / 2;
        info.srcY = (img.height - info.srcHeight) / 2;
        return info;
    };

    var createThumb = function (resizeInfo, img) {
        var canvas, ctx, /*resizeInfo,*/ thumbnail, _ref, _ref1, _ref2, _ref3;

        if (resizeInfo.trgWidth == null) {
            resizeInfo.trgWidth = resizeInfo.optWidth;
        }
        if (resizeInfo.trgHeight == null) {
            resizeInfo.trgHeight = resizeInfo.optHeight;
        }
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        canvas.width = resizeInfo.trgWidth;
        canvas.height = resizeInfo.trgHeight;
        drawImageIOSFix(ctx, img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
        return canvas.toDataURL("image/png");
    };


    var detectVerticalSquash = function (img) {
        var alpha, canvas, ctx, data, ey, ih, iw, py, ratio, sy;
        iw = img.naturalWidth;
        ih = img.naturalHeight;
        canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = ih;
        ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        data = ctx.getImageData(0, 0, 1, ih).data;
        sy = 0;
        ey = ih;
        py = ih;
        while (py > sy) {
            alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }
        ratio = py / ih;
        if (ratio === 0) {
            return 1;
        } else {
            return ratio;
        }
    };

    var drawImageIOSFix = function (ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
        var vertSquashRatio;
        vertSquashRatio = detectVerticalSquash(img);
        return ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
    };

    var fileReader = function (fileUrl) {

        var img = angular.element("img")
                    .attr("src", fileUrl);

        img.onload = function () {
            var canvas, ctx, resizeInfo, thumbnail, _ref, _ref1, _ref2, _ref3;
            file.width = img.width;
            file.height = img.height;
            resizeInfo = _this.options.resize.call(_this, file);
            if (resizeInfo.trgWidth == null) {
                resizeInfo.trgWidth = resizeInfo.optWidth;
            }
            if (resizeInfo.trgHeight == null) {
                resizeInfo.trgHeight = resizeInfo.optHeight;
            }
            canvas = document.createElement("canvas");
            ctx = canvas.getContext("2d");
            canvas.width = resizeInfo.trgWidth;
            canvas.height = resizeInfo.trgHeight;
            drawImageIOSFix(ctx, img, (_ref = resizeInfo.srcX) != null ? _ref : 0, (_ref1 = resizeInfo.srcY) != null ? _ref1 : 0, resizeInfo.srcWidth, resizeInfo.srcHeight, (_ref2 = resizeInfo.trgX) != null ? _ref2 : 0, (_ref3 = resizeInfo.trgY) != null ? _ref3 : 0, resizeInfo.trgWidth, resizeInfo.trgHeight);
            thumbnail = canvas.toDataURL("image/png");
            _this.emit("thumbnail", file, thumbnail);
        };
    };

    return mySelf;
})();



