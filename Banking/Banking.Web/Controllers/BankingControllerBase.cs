using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Configuration;
using System.Xml.Linq;
using System.Text;
using System.IO;
using System.Data.Entity;

using Banking.Domain;
using Banking.EFData;
using Banking.Backup;


namespace Banking.Web.Controllers
{
    public abstract class BankingControllerBase : Controller
    {
        protected override void Initialize(RequestContext rc)
        {
            base.Initialize(rc);
            var config = WebConfigurationManager.OpenWebConfiguration("/"); // root
            string cs = config.ConnectionStrings.ConnectionStrings["BankingRelease"].ConnectionString;
            Storage.Database.Connection.ConnectionString = cs;
            System.Data.Entity.Database.SetInitializer<EFStorage>(null);
        }

        protected EFStorage Storage = new EFStorage();
        protected Backuper Backuper = new Backuper(ToLocalPath("backup"));

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
            session.ExpiresAt = DateTime.Now + Security.SessionTimeout;
            Storage.SaveChanges();
        }

        [NonAction]
        public JsonResult Error(string text)
        {
            return Json(new { error = text });
        }

        // makes a database snapshot 
        [NonAction]
        public void BackupIfNecessary(string mark) //TODO: write BackupIfNecessary()
        {
            DateTime lastBackup = Directory.GetLastWriteTime(Backuper.Path);
            if (DateTime.Now - lastBackup > Security.BackupInterval)
                Backuper.Save(CreateSnapshot(mark));
        }

        [NonAction]
        protected Snapshot CreateSnapshot(string mark)
        {
            return new Snapshot()
            {
                Operations = Storage.Operations.ToList(),
                Persons = Storage.Persons.ToList(),
                Mark = mark,
                Time = DateTime.Now
            };
        }

        [NonAction]
        protected static string ToLocalPath(string path)
        {
            return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, path);
        }
    }
}
