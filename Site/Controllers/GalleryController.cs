using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
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
        private const string MetadataFileName = "gallery.metadata";
        /// <summary>
        /// return a list of all Galleries
        /// GET api/gallery
        /// </summary>
        /// <returns>a list of gallery objects</returns>
        public IEnumerable<Gallery> Get()
        {
            var folders = GetAllGalleryFolders();

            return GalleriesFromFolders(folders);
        }

        /// <summary>
        /// return a single gallery
        /// GET api/gallery/{id}
        /// </summary>
        /// <param name="id">id of the gallery</param>
        /// <returns>A Gallery object</returns>
        public Gallery Get(string id)
        {
            return new Gallery() ;
        }

        /// <summary>
        /// Create a new gallery and its ID. Return the GalleryId 
        /// POST api/gallery
        /// no content body
        /// </summary>
        /// <returns>An HttpResponseMessage</returns>
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


        /// <summary>
        /// Add an image to a gallery
        /// PUT api/gallery/{id}/image
        /// Content body is MIME content that contains an image to add to the gallery
        /// </summary>
        /// <param name="id">id of the gallery</param>
        /// <returns>HttpResponseMessage</returns>
        [HttpPut]
        public async Task<HttpResponseMessage> Image(string id)
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

        /// <summary>
        /// Save the gallery metadata
        /// PUT api/gallery/{id}/metdata
        /// </summary>
        /// <param name="id">The gallery ID</param>
        /// <param name="metadata">The metadata to save</param>
        /// <returns>HTTP Response message</returns>
        [HttpPut]
        public HttpResponseMessage Metadata(string id, GalleryMetadata metadata)
        {
            if (metadata == null || (metadata.Title == null && metadata.Description == null))
            {
                Trace.TraceInformation("PUT GalleryMetadata did not save metadata. No metadata was received");
                return new HttpResponseMessage(HttpStatusCode.OK);
            }
            metadata.Id = TrimName(id);
            WriteMetadata(id, metadata);

            Trace.TraceInformation("PUT GalleryMetadata title: {0}{1}description: {1}",
                metadata.Title, Environment.NewLine, metadata.Description);

            return new HttpResponseMessage(HttpStatusCode.OK);
        }

        /// <summary>
        /// Delete file from gallery
        /// DELETE api/gallery/{id}?file={filename}
        /// </summary>
        /// <param name="id">gallery id</param>
        /// <param name="file">name of file to delete</param>
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

        /// <summary>
        /// Delete an entire gallery
        /// DELETE api/gallery/{id}
        /// </summary>
        /// <param name="id">id of the gallery to delete</param>
        public void Delete(string id)
        {
            var path = GetGalleryFolder(id);
            if (Directory.Exists(path))
            {
                Directory.Delete(path, true);
                Trace.TraceInformation("delete entire gallery with id {0}", path);
            }
            else
            {
                Trace.TraceInformation("no directory to delete at path {0}", path);
            }
        }

        // Helpers
        private static IEnumerable<Gallery> GalleriesFromFolders(IEnumerable<string> folders)
        {
            var results = new List<Gallery>();
            foreach(var galleryFolder in folders)
            {
                var gallery = new Gallery();
                
                // read metadata. Note we already checked that the metadata file exists
                using (StreamReader reader = new StreamReader(
                    Path.Combine(galleryFolder, MetadataFileName)))
                    {
                        var json = reader.ReadToEnd();
                        gallery.Metadata = JsonConvert.DeserializeObject<GalleryMetadata>(json);
                    }

                // read all the files in the directory
                var files = Directory.EnumerateFiles(galleryFolder);
                var pathElements = galleryFolder.Split(new char[] {'\\'});
                var galleryRoot = pathElements[pathElements.Length-2];
                var galleryDir = pathElements[pathElements.Length-1];
                var galleryUrlTemplate = "/{0}/{1}/{2}";
                
                var fileUrls = new List<string>();
                foreach(var file in files)
                {
                    if (!Path.GetFileName(file).Equals(MetadataFileName))
                    {
                        fileUrls.Add(string.Format(galleryUrlTemplate, galleryRoot, galleryDir, Path.GetFileName(file)));
                    }
                }
                gallery.ImageUrls = fileUrls;
                results.Add(gallery);
            }

            return results;
        }

        private static IEnumerable<string> GetAllGalleryFolders()
        {
            var folder = ConfigurationManager.AppSettings["GalleryFolder"];
            var vpath = HttpContext.Current.Server.MapPath("~");
            vpath = Path.Combine(vpath, folder);
            var directories = Directory.GetDirectories(vpath);
            var validDirectories = new List<string>();
            foreach(var directory in directories)
            {
                if (File.Exists(Path.Combine(directory, MetadataFileName)))
                {
                    validDirectories.Add(directory);
                }
            }
            return validDirectories;
        }
        private static void WriteMetadata(string id, GalleryMetadata metadata) 
        {
            var folder = GetGalleryFolder(id);
            var metadataPath = Path.Combine(folder, MetadataFileName);

            using (FileStream fs = new FileStream(metadataPath, FileMode.Create, FileAccess.Write, FileShare.None))
            {
                using (StreamWriter writer = new StreamWriter(fs, Encoding.UTF8))
                {
                    writer.Write(JsonConvert.SerializeObject(metadata));
                }
            }
            
        }
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