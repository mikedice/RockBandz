using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using InTheFrontRow.Models.Gallery;
using Newtonsoft.Json;

namespace InTheFrontRow.Controllers
{
    public class GalleryController : ApiController
    {
        //  returns list of all galleries
        // /api/gallery
        public IEnumerable<Gallery> Get()
        {
            return new List<Gallery>();
        }

        // returns a single gallery. 
        // Id parameter can be the gallery id or the name
        // api/gallery/id
        public Gallery Get(string id)
        {
            return new Gallery() { Name = "frack!" };
        }

        // Create a new gallery and its ID. Return the GalleryId
        // POST api/gallery
        //   no content body is read
        // galleryId is a unique ID for a gallery
        public Task<HttpResponseMessage> Post()
        {
            Guid galleryId = Guid.NewGuid();
            MakeGalleryFolder(galleryId);
            
            // Create successful response content
            var response = new HttpResponseMessage(HttpStatusCode.OK);
            var createResponse = new CreateGalleryResponse()
            {
                GalleryId = galleryId.ToString()
            };
            response.Content = new StringContent(JsonConvert.SerializeObject(createResponse), System.Text.Encoding.UTF8);

            var tco = new TaskCompletionSource<HttpResponseMessage>();
            tco.SetResult(response);
            return tco.Task;
        }

        // Add images to gallery. Must supply the id of an existing gallery
        // PUT api/gallery/id
        //  content body is MIME content that contains an image.
        public async Task<HttpResponseMessage> Put(string id)
        {
            var galleryFolder = GetGalleryFolder(id);

            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent())
            {
                throw new HttpResponseException(HttpStatusCode.UnsupportedMediaType);
            }

            var provider = new MultipartFormDataStreamProvider(galleryFolder);

            Trace.TraceInformation("Before async on thread {0}", Thread.CurrentThread.ManagedThreadId);
            
            // Read the form data and return an async task.
            await Request.Content.ReadAsMultipartAsync(provider);

            Trace.TraceInformation("after async on thread {0}", Thread.CurrentThread.ManagedThreadId);

            // This illustrates how to get the file names.
            foreach (MultipartFileData file in provider.FileData)
            {
                Trace.TraceInformation(file.Headers.ContentDisposition.FileName);
                Trace.TraceInformation("Server file path: {0}", file.LocalFileName);
                Trace.TraceInformation("GalleryId: {0}", id);
                var fileName = TrimName(file.Headers.ContentDisposition.FileName);

                var filePath = Path.Combine(Path.GetDirectoryName(file.LocalFileName), fileName);
                if (!File.Exists(filePath))
                {
                    File.Move(file.LocalFileName, filePath);
                }
                Trace.TraceInformation("Created file: {0}", filePath);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // DELETE api/gallery/id
        public void Delete(string id, string file)
        {
            var galleryFile = GetGalleryFile(TrimName(id), TrimName(file));
            if (File.Exists(galleryFile))
            {
                File.Delete(galleryFile);
                Trace.TraceInformation("delete file deleted file {0} from gallery {1}", file, id);
            }
            else
            {
                Trace.TraceInformation("delete file file didn't exist , file {0} from gallery {1}", file, id);
            }
        }

        // Helpers
        private static string GetGalleryFile(string galleryName, string galleryFile)
        {
            var galleryFolder = GetGalleryFolder(galleryName);
            var result = Path.Combine(galleryFolder, galleryFile);
            return result;
        }
        private static string GetGalleryFolder(string galleryName)
        {
            var folder = ConfigurationManager.AppSettings["GalleryFolder"];
            var vpath = HttpContext.Current.Server.MapPath("~");
            vpath = Path.Combine(vpath, folder);

            var combined = Path.Combine(vpath, TrimName(galleryName));
            if (!Directory.Exists(combined))
            {
                throw new InvalidOperationException("gallery doesn't exist");
            }
            return combined;
        }
        private static void MakeGalleryFolder(Guid gallery)
        {
            var folder = ConfigurationManager.AppSettings["GalleryFolder"];
            var vpath = HttpContext.Current.Server.MapPath("~");
            vpath = Path.Combine(vpath, folder);
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
        private static string TrimName(string name)
        {
            var result = name.Trim();
            result = name.Replace("\"", string.Empty);
            return result;
        }
    }
}