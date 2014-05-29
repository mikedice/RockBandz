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
using InTheFrontRow.Models.Gallery;

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

        // Create a new gallery. Gallery ID is supplied by the caller. Gallery ID must parse as a GUID
        // POST api/gallery/id
        //   no content body is read
        // galleryId is a unique ID for a gallery
        public Task<HttpResponseMessage> Post(string id)
        {
            // var galleryId = Guid.Parse(galleryUUID);
            // MakeGalleryFolder(galleryId);
            var tco = new TaskCompletionSource<HttpResponseMessage>();
            tco.SetResult(new HttpResponseMessage(HttpStatusCode.OK));
            return tco.Task;
        }

        // Create a new gallery. Gallery ID is created on the server
        // POST api/gallery
        //   no content body is read
        // galleryId is a unique ID for a gallery
        public Task<HttpResponseMessage> Post()
        {
            // var galleryId = Guid.Parse(galleryUUID);
            // MakeGalleryFolder(galleryId);
            var tco = new TaskCompletionSource<HttpResponseMessage>();
            tco.SetResult(new HttpResponseMessage(HttpStatusCode.OK));
            return tco.Task;
        }

        // Add images to gallery. Must supply the id of an existing gallery
        // PUT api/gallery/id
        //  content body is MIME content that contains an image.
        public Task<HttpResponseMessage> Put(string id)
        {
            var tco = new TaskCompletionSource<HttpResponseMessage>();
            tco.SetResult(new HttpResponseMessage(HttpStatusCode.OK));
            return tco.Task;
        }

        // Helpers
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