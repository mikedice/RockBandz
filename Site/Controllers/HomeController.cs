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
                    GalleryWidgetIdSelector = string.Format("#blueimp-gallery-{0}", i)
                });
            }
            var viewModel = new HomeModel()
            {
                Galleries = viewGalleries
            };
            return View(viewModel);
        }
	}
}