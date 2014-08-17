using System;
using System.Linq;
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

            return OrderGalleries(results);
        }

        class OrderedGallery
        {
            public DateTime Date { get; set; }
            public Gallery Gallery { get; set; }
        }

        public static IEnumerable<Gallery> OrderGalleries(IEnumerable<Gallery> galleries)
        {
            // A full datetime pattern was added to GalleryMetadata after release so
            // use that property if it is available, otherwise use the shorter lastupdatetime
            // pattern if that is available, otherwise use DateTime.MinValue
            List<OrderedGallery> orderedList = new List<OrderedGallery>();
            foreach (var gallery in galleries)
            {
                OrderedGallery og = new OrderedGallery();
                og.Gallery = gallery;

                if (!string.IsNullOrEmpty(gallery.Metadata.LastUpdateTimeFull))
                {
                    og.Date = DateTime.Parse(gallery.Metadata.LastUpdateTimeFull);
                }
                else if (!string.IsNullOrEmpty(gallery.Metadata.LastUpdateTime))
                {
                    og.Date = DateTime.Parse(gallery.Metadata.LastUpdateTime);
                }
                else
                {
                    og.Date = DateTime.MinValue;
                }
                orderedList.Add(og);
            }

            var sorted = orderedList.OrderByDescending(m => m.Date);
            List<Gallery> result = new List<Gallery>();
            foreach (var gallery in sorted)
            {
                result.Add(gallery.Gallery);
            }

            return result;
        }
    }
}