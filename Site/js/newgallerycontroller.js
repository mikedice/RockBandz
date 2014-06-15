(function (module) {

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
    module.controller('NewGalleryController', ['$scope', '$http', '$log', '$upload', 'thumbnailSvc',
        function ($scope, $http, $log, $upload, thumbnailSvc) {
            // service dependencies
            mScope = $scope;
            mHttpSvc = $http;
            mLogSvc = $log;
            mUploadSvc = $upload;
            mTnailSvc = thumbnailSvc;

            // Initialize scope handlers
            mScope.onFileSelect = function (files) { handleFileSelect(files); }
            mScope.SaveGallery = function () { handleSaveGallery(); }
            mScope.CancelGallery = function () { handleCancelGallery(); }
            mScope.SaveAndClose = function () { handleSaveAndClose(); }
            mScope.RemoveOneImage = function (imageName) { handleRemoveOneImage(imageName); }
            mScope.GetRemoveAllDisabled = function () { return Object.keys(mImageList).length == 0; }
            mScope.RemoveAllImages = function () { handleRemoveAll(); }

            // Initialize scope data
            mScope.galleryTitle = null;
            mScope.galleryDescription = null;
            mScope.readyForUpload = false;
            mScope.imageList = null;
            mScope.newGalleryVisible = false;

            // Before we allow an upload we create a gallery and get the new gallery's ID.
            mHttpSvc.post(mGalleryApiUrl).
                success(function (data) {
                    // Save the gallery ID
                    mGalleryId = data.GalleryId;
                    mUploadUrl = mGalleryApiRoot + mGalleryId + "/image";

                    mScope.readyForUpload = true;
                }).error(function (data) {
                    window.alert(data.error);
                })
        }]);

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

    var handleRemoveOneImage = function(fileName)
    {
        if (mScope.imageList[fileName] != 'undefined' &&
            mScope.imageList[fileName] != null)
        {
            // delete from local list of images
            delete mScope.imageList[fileName];

            // send a delete to the server
            mHttpSvc.delete(mGalleryApiRoot + mGalleryId + '?file=' + fileName)
                    .success(function (data) { })
                    .error(function (data) { window.alert(data.error); })
        }
    }
    
    var handleRemoveAll = function () {
        var keys = Object.keys(mScope.imageList);
        for (i=0; i<keys.length; i++)
        {
            delete mScope.imageList[keys[i]];

            // send a delete to the server
            mHttpSvc.delete(mGalleryApiRoot + mGalleryId + '?file=' + keys[i])
                    .success(function (data) { })
                    .error(function (data) { window.alert(data.error); })

        }
    }
    

    // handleSaveGallery 'commits' a new gallery. If this isn't called the new gallery will
    // not be saved.
    var handleSaveGallery = function () {
        if (mGalleryId != null &&
            mScope.galleryTitle != null &&
            mScope.galleryTitle.length > 0) {

            var metadata = {
                Title: mScope.galleryTitle,
                Description: mScope.galleryDescription
            };

            mHttpSvc.put(mGalleryApiRoot + mGalleryId + "/metadata", metadata);
        }
    }

    var handleSaveAndClose = function () {
        handleSaveGallery();
        window.location = "/manage.html";
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


})(angular.module('InTheFrontRowModule'));
