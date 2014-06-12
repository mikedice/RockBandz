var InTheFrontRow = InTheFrontRow || {};
InTheFrontRow.Management = InTheFrontRow.Management || {};
InTheFrontRow.Management.NewGalleryController = (function (mySelf) {

    var mScope;
    var mHttpSvc;
    var mLogSvc;
    var mUploadSvc;
    var mTnailSvc;
    var mInputFormSelector = "#uploadFilesForm";
    var mGalleryApiUrl = "api/gallery";
    var mGalleryApiRoot = "api/gallery/";
    var mGalleryId = null;
    var mUploadUrl = null;
    var mImageList = {};

    // The controller function
    mySelf.ControllerFunction = function (scope, httpSvc, logSvc, uploadSvc, thumbnailSvc) {
        // service dependencies
        mScope = scope;
        mHttpSvc = httpSvc;
        mLogSvc = logSvc;
        mUploadSvc = uploadSvc;
        mTnailSvc = thumbnailSvc;

        // Initialize scope handlers
        mScope.onFileSelect = function (files) { handleFileSelect(files); }
        mScope.SaveGallery = function () { handleSaveGallery(); }
        mScope.CancelGallery = function () { handleCancelGallery(); }

        // Initialize scope data
        mScope.galleryTitle = null;
        mScope.galleryDescription = null;
        mScope.readyForUpload = false;
        mScope.imageList = null;

        mScope.tinymceOptions = {
            plugins: 'image link',
            toolbar: ['bold italic underline strikethrough fontselect | alignleft aligncenter alignright alignjustify',
            'image link hr'],
            font_formats: "Andale Mono=andale mono,times;" +
                "Arial=arial,helvetica,sans-serif;" +
                "Arial Black=arial black,avant garde;" +
                "Book Antiqua=book antiqua,palatino;" +
                "Comic Sans MS=comic sans ms,sans-serif;" +
                "Courier New=courier new,courier;" +
                "Georgia=georgia,palatino;" +
                "Helvetica=helvetica;" +
                "Impact=impact,chicago;" +
                "Symbol=symbol;" +
                "Tahoma=tahoma,arial,helvetica,sans-serif;" +
                "Terminal=terminal,monaco;" +
                "Times New Roman=times new roman,times;" +
                "Trebuchet MS=trebuchet ms,geneva;" +
                "Verdana=verdana,geneva;" +
                "Webdings=webdings;" +
                "Wingdings=wingdings,zapf dingbats"

        }

        // Before we allow an upload we create a gallery and get the new gallery's ID.
        httpSvc.post(mGalleryApiUrl).
            success(function (data) {
                // Save the gallery ID
                mGalleryId = data.GalleryId;
                mUploadUrl = mGalleryApiRoot + mGalleryId + "/image";

                mScope.readyForUpload = true;
            }).error(function (data) {
                window.alert(data.error);
            })
    }

    // handler for files getting selected in the upload form
    var handleFileSelect = function (files) {
        var expectedCount = files.length;
        var actualCount = 0;

        for (var i = 0; i < files.length; i++) {
            mLogSvc.log("uploading file: " + files[i].name);
            var file = files[i];
            mScope.upload = mUploadSvc.upload({
                method: 'PUT',
                url: mUploadUrl,
                file: file,
            }).progress(function (evt) {
                mLogSvc.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
            }).success(function (data, status, headers, config) {
                // file is uploaded successfully
                mLogSvc.log(config.file.name + " uploaded successfully");
                afterUpload(expectedCount, ++actualCount, config, true);
            }).error(function (data, status, headers, config) {
                mLogSvc.log(config.file.name + " upload error " + status);
                afterUpload(expectedCount, ++actualCount, config, false);
            });
        }
    }

    // handleSaveGallery 'commits' a new gallery. If this isn't called the new gallery will
    // not be saved.
    var handleSaveGallery = function () {
        if (mGalleryId != null) {

            var metadata = {
                Title: mScope.galleryTitle,
                Description: mScope.galleryDescription
            };

            mHttpSvc.put(mGalleryApiRoot + mGalleryId + "/metadata", metadata);
        }
    }

    // handleCancelGallery deletes the gallery because user didn't want to save it.
    var handleCancelGallery = function () {
        if (mScope.galleryId != null) {
            mHttpSvc.delete(mGalleryApiRoot + mGalleryId)
                                .success(function (data) { })
                                .error(function (data) { window.alert(data.error); })
        }
        window.location = "/manage.html";
    }
    // after upoads we reset the upload form to clear the input control
    var afterUpload = function (expectedCount, actualCount, config, succeeded) {
        if (actualCount >= expectedCount) {
            resetForm();
        }

        if (succeeded) {
            createThumbnail(config.file);
        }
    }

    var createThumbnail = function (file) {
        var _fileName = escape(file.name);
        if (mImageList.hasOwnProperty(_fileName)) {
            return;
        }

        var reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                mLogSvc.log("createThumbnail file has been read");
                var dataUrl = e.target.result;

                // Image wasn't previously loaded add result to mImageList 'dictionary'
                mImageList[_fileName] = {
                    dataUrl: dataUrl,
                    name: theFile.name,
                    type: theFile.type
                };

                var img = document.createElement("img");
                img.addEventListener('load', function (arg) {
                    console.log("createThumbnail image was loaded");

                    // compute the thumbnail...
                    var options = mTnailSvc.resize(arg.target);
                    var thumbData = mTnailSvc.createThumb(options, arg.target);

                    mImageList[_fileName].Thumbnail = thumbData;
                    console.log("createThumbnail stored thumbnail for image: " + theFile.name);
                    mScope.$apply(function () {
                        mScope.imageList = mImageList;
                    });
                }, false);
                console.log("createThumbnail will load image: " + theFile.name);
                img.src = dataUrl;

            };
        })(file);
        reader.readAsDataURL(file);
    }

    var resetForm = function () {
        var frm = angular.element(mInputFormSelector)[0];
        frm.reset();
        mLogSvc.log("uploadFilesForm has been reset");
    }

    return mySelf;
})(InTheFrontRow.Management.NewGalleryController || {});
