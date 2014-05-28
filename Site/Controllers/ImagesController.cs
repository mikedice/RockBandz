using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;

namespace WebApplication1.Controllers
{
    public class ImagesController : ApiController
    {
        public int Get()
        {
            return 1;
        }

        //public string GetNewGallery()
        //{
        //    var gallery = Guid.NewGuid();
        //    MakeGalleryFolder(gallery);
        //    return gallery.ToString();
        //}
        
        // POST api/images
        public Task<HttpResponseMessage> Post(string galleryName)
        {
            var galleryFolder = GetGalleryFolder(galleryName);

            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }


            var provider = new MultipartFormDataStreamProvider(galleryFolder);

            // Read the form data and return an async task.
            var task = Request.Content.ReadAsMultipartAsync(provider).
                ContinueWith(t =>
                {
                    if (t.IsFaulted || t.IsCanceled)
                    {
                        Request.CreateErrorResponse(HttpStatusCode.InternalServerError, t.Exception);
                    }

                    // This illustrates how to get the file names.
                    foreach (MultipartFileData file in provider.FileData)
                    {
                        Trace.TraceInformation(file.Headers.ContentDisposition.FileName);
                        Trace.TraceInformation("Server file path: {0}", file.LocalFileName);
                        Trace.TraceInformation("GalleryName: {0}", galleryName);
                    }
                    return Request.CreateResponse(HttpStatusCode.OK);
                });

            return task;
        }

        private static string GetGalleryFolder(string galleryName)
        {
            var folder = ConfigurationManager.AppSettings["GalleryFolder"];
            var vpath = HttpContext.Current.Server.MapPath(folder);
            galleryName = galleryName.Trim();
            galleryName = galleryName.Replace("\"", string.Empty);
            
            var combined = Path.Combine(vpath, galleryName);
            if (!Directory.Exists(combined))
            {
                throw new InvalidOperationException("gallery doesn't exist");
            }
            return combined;
        }

        private static void MakeGalleryFolder(Guid gallery)
        {
            var folder = ConfigurationManager.AppSettings["GalleryFolder"];
            var vpath = HttpContext.Current.Server.MapPath(folder);
            if (!Directory.Exists(vpath))
            {
                Directory.CreateDirectory(vpath);
            }
            var combined = Path.Combine(vpath, gallery.ToString());
            if (!Directory.Exists(combined))
            {
                Directory.CreateDirectory(combined);
            }
        }
	}
}