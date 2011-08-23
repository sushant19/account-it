using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Banking.Web
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public string DecimalFormat { get { return "G29"; } }
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "EnterCode",
                "authorize",
                new { controller = "Home", action = "EnterCode" }
            );

            routes.MapRoute(
                "AllOperations",
                "operations",
                new { controller = "Operation", action = "All" }
            );

            routes.MapRoute(
                "AllPersons",
                "persons",
                new { controller = "Person", action = "All" }
            );

            routes.MapRoute(
                "Backups",
                "backups",
                new { controller = "Home", action = "AllBackups" }
            );

            routes.MapRoute(
                "MakeBackup",
                "makeBackup",
                new { controller = "Home", action = "MakeBackup" }
            );

            routes.MapRoute(
                "RestoreBackup",
                "restoreBackup/{name}",
                new { controller = "Home", action = "RestoreBackup" }
            );


            routes.MapRoute(
                "History",
                "{name}",
                new { controller = "Person", action = "ViewHistory" }
            );

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Operation", action = "All", id = UrlParameter.Optional } // Parameter defaults
            );

        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
        }
    }
}