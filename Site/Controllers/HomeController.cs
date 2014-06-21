using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using InTheFrontRow.Helpers;
using InTheFrontRow.Models.Views.Home;

namespace InTheFrontRow.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            var folders = GalleryHelpers.GetAllGalleryFolders();
            var galleries = GalleryHelpers.GalleriesFromFolders(folders);
            var viewModel = new HomeModel()
            {
                Galleries = galleries
            };
            return View(viewModel);
        }
	}
}