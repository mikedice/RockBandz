using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using InTheFrontRow.Helpers;
using InTheFrontRow.Models.Views.Home;
using viewgal = InTheFrontRow.Models.Views.Home.Gallery;
using gal = InTheFrontRow.Models.Gallery.Gallery;

namespace InTheFrontRow.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var folders = GalleryHelpers.GetAllGalleryFolders();
            var galleries = GalleryHelpers.GalleriesFromFolders(folders);
            var arr = galleries.ToArray<gal>();
            
            List<viewgal> viewGalleries = new List<viewgal>();

            for (int i = 0; i<arr.Length; i++)
            {
                viewGalleries.Add(new viewgal()
                {
                    GalleryData = arr[i],
                    GalleryWidgetId = string.Format("blueimp-gallery-{0}", i),
                    GalleryWidgetIdSelector = string.Format("#blueimp-gallery-{0}", i),
                    ImageLinks = MakeImageLinks(arr[i])
                });
            }
            var viewModel = new HomeModel()
            {
                Galleries = viewGalleries
            };
            return View(viewModel);
        }
        public static IEnumerable<GalleryLink> MakeImageLinks(gal gallery)
        {
            var galleryLinks = new List<GalleryLink>();
            foreach(var imageUrl in gallery.ImageUrls)
            {
                galleryLinks.Add(new GalleryLink()
                {
                    ImageUrl = imageUrl,
                    ThumbUrl = MakeThumbUrl(imageUrl)
                });
            }
            return galleryLinks;
        }

        public static string MakeThumbUrl(string imageUrl)
        {
            int lastSlash = imageUrl.LastIndexOf("/");

            string root = imageUrl.Substring(0, lastSlash);
            root += "/thumbnail";
            root += imageUrl.Substring(lastSlash, imageUrl.Length-lastSlash);
            return root;

        }
	}
}