
var InTheFrontRow = InTheFrontRow || {};
InTheFrontRow.Management = InTheFrontRow.Management || {};
InTheFrontRow.Management.ManagementController = (function(mySelf) {
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

        // Start up async processing for this controller
        mHttpService.get("/api/gallery")
            .success(function (data) {

                processGallery(data, function (galleryIndex, thumbnails) {

                    // save the thumbnail list on the gallery
                    data[galleryIndex].thumbnails = thumbnails;
                    var done = true;

                    // check to see if all thumbnails on all galleries have been created
                    for (i = 0; i < data.length; i++) {
                        if (data[i].thumbnails != null && data[i].ImageUrls != null && data[i].ImageUrls.length > 0) {
                            if (data[i].thumbnails.length != data[i].ImageUrls.length) {
                                done = false;
                                break;
                            }
                        }

                    }

                    // If all thumbnails on all galleries have been created, bind the gallery list
                    // to the scope so they can be displayed.
                    if (done) {
                        mScope.$apply(function () {
                            mScope.galleryList = data;
                        });
                    }
                });
            })
            .error(function (data) {
                window.alert(data.error);
            });

    }

    // ProcessGallery takes a list of image galleries. For every image in the gallery, a thumbnail
    // gets created for the image. For every thumbnail that gets created the callback is called with
    // the index of the gallery and an array of thumbnails that have so far been created for the gallery.
    // The caller needs to keep track of how many thumbnails have been created for the gallery and do something
    // sensible when they have all been created
    var processGallery = function (galleries, callback) {
        if (galleries == null || typeof galleries.length == 'undefined' || galleries.length <= 0)
            return;

        for (i = 0; i < galleries.length; i++) {
            if (galleries[i].ImageUrls == null || galleries[i].ImageUrls.length <= 0) {
                continue;
            }

            for (p = 0; p < galleries[i].ImageUrls.length; p++) {
                var resultCollection = [];
                var galleryIndex = i;
                var img = document.createElement("img");
                img.addEventListener('load', function (arg) {
                    mLogService.info("image loaded");
                    var options = resize(arg.target);
                    var thumbData = createThumb(options, arg.target);
                    resultCollection.push({ id: p, data: thumbData });
                    callback.apply(mySelf, [galleryIndex, resultCollection]);
                }, false);

                img.src = galleries[i].ImageUrls[p];
            }
        }
    };

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
})(InTheFrontRow.Management.ManagementController || {});



