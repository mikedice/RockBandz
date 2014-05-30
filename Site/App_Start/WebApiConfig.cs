using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace InTheFrontRow
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API routes
            config.MapHttpAttributeRoutes();

            // controller, implied action, optional id
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new {id = RouteParameter.Optional});

            // controller with specific action and id.
            config.Routes.MapHttpRoute(
                name: "action and ID",
                routeTemplate: "api/{controller}/{id}/{action}");
        }
    }
}
