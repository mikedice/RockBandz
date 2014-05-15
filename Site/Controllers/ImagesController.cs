using System;
using System.Collections.Generic;
using System.Diagnostics;
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
        //
        // GET: /Images/
        public int Index()
        {
            return 1;
        }
        
        // POST api/images
        public Task<HttpResponseMessage> Post(string galleryName)
        {
            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            string root = HttpContext.Current.Server.MapPath("~/App_Data");
            var provider = new MultipartFormDataStreamProvider(root);

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
	}
}