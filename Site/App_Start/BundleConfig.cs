using System.Web;
using System.Web.Optimization;

namespace InTheFrontRow
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                        "~/js/jquery-1.10.2.min.js",
                        "~/js/jquery.blueimp-gallery.min.js",
                        "~/js/bootstrap-image-gallery.js",
                        "~/js/bootstrap.js",
                        "~/js/angular.js",
                        "~/js/angular-file-upload.js",
                        "~/js/ui-bootstrap-tpls-0.11.0.js",
                        "~/js/module.js",
                        "~/js/thumbnailsSvc.js",
                        "~/js/filereaderSvc.js",
                        "~/js/homecontroller.js"));

            bundles.Add(new StyleBundle("~/Content/styles").Include(
                      "~/css/blueimp-gallery.min.css",
                      "~/css/site.css",
                      "~/css/BootstrapThemes/bootstrap.css",
                      "~/css/bootstrap-image-gallery.css"));
        }
    }
}