using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Configuration;

using Banking.Domain;
using Banking.EFData;
using System.Data.Entity;

namespace Banking.Web.Controllers
{
    public abstract class BankingControllerBase : Controller
    {
        protected override void Initialize(RequestContext rc)
        {
            base.Initialize(rc);
            var config = WebConfigurationManager.OpenWebConfiguration("/"); // root
            string cs = config.ConnectionStrings.ConnectionStrings["BankingDebug"].ConnectionString;
            Storage.Database.Connection.ConnectionString = cs;
            System.Data.Entity.Database.SetInitializer<EFStorage>(new DropCreateDatabaseIfModelChanges<EFStorage>());
        }

        protected EFStorage Storage = new EFStorage();

        [NonAction]
        private Session GetSession(string ssid)
        {
            var guid = new Guid(ssid); //yes, it's fucking dangerous, so what?!
            Session session = Storage.Sessions.
                SingleOrDefault(s => s.SessionId == guid);
            return session;
        }

        [NonAction]
        public bool IsValidSession(string ssid)
        {
            Session session = GetSession(ssid);
            if (session != null && session.ExpiresAt >= DateTime.Now)
                return true;
            else
                return false;

        }

        [NonAction]
        public void UpdateSession(string ssid)
        {
            Session session = GetSession(ssid);
            session.ExpiresAt = DateTime.Now + Security.Timeout;
            Storage.SaveChanges();
        }

        [NonAction]
        public JsonResult MakeJson(object data)
        {
            return Json(data);
        }
    }
}
