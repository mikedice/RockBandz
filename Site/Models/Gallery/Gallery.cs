using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InTheFrontRow.Models.Gallery
{
    public class Gallery
    {
        public GalleryMetadata Metadata { get; set; }
        public IEnumerable<string> ImageUrls { get; set; }
    }
}