using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using gal = InTheFrontRow.Models.Gallery;

namespace InTheFrontRow.Models.Views.Home
{
    public class Gallery
    {
        public gal.Gallery GalleryData { get; set; }
        public string GalleryWidgetId { get; set; }
        public string GalleryWidgetIdSelector { get; set; }
    }
}