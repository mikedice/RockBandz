
var InTheFrontRow = InTheFrontRow || {};
InTheFrontRow.Services = InTheFrontRow.Services || {};
InTheFrontRow.Services.Thumbnails = (function (mySelf) {

    var tnailModule = angular.module('ThumbnailServiceModule', []);
    tnailModule.service('thumbnailSvc', function ($log) {
        this.resize = function (imgTag) {
            return _resize(imgTag);
        }

        this.createThumb = function (options, imgTag) {
            return _createThumb(options, imgTag);
        }
    });

    // helpers borrowed from dropzone
    var _resize = function (img) {
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

    var _createThumb = function (resizeInfo, img) {
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
})(InTheFrontRow.Services.Thumbnails || {});