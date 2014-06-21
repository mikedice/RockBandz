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

namespace InTheFrontRow.Helpers
{
    public static class GalleryHelpers
    {
        private const string MetadataFileName = "gallery.metadata";

        public static IEnumerable<string> GetAllGalleryFolders()
        {
            var folder = ConfigurationManager.AppSettings["GalleryFolder"];
            var vpath = HttpContext.Current.Server.MapPath("~");
            vpath = Path.Combine(vpath, folder);
            var directories = Directory.GetDirectories(vpath);
            var validDirectories = new List<string>();
            foreach (var directory in directories)
            {
                if (File.Exists(Path.Combine(directory, MetadataFileName)))
                {
                    validDirectories.Add(directory);
                }
            }
            return validDirectories;
        }

        public static IEnumerable<Gallery> GalleriesFromFolders(IEnumerable<string> folders)
        {
            var results = new List<Gallery>();
            foreach (var galleryFolder in folders)
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
                var pathElements = galleryFolder.Split(new char[] { '\\' });
                var galleryRoot = pathElements[pathElements.Length - 2];
                var galleryDir = pathElements[pathElements.Length - 1];
                var galleryUrlTemplate = "/{0}/{1}/{2}";

                var fileUrls = new List<string>();
                foreach (var file in files)
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
    }
}