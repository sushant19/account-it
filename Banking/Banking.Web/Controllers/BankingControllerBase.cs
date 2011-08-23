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
            string cs = config.ConnectionStrings.ConnectionStrings["BankingRelease"].ConnectionString;
            Storage.Database.Connection.ConnectionString = cs;
            System.Data.Entity.Database.SetInitializer<EFStorage>(null);
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
        public void BackupIfNecessary()
        {
            DateTime lastBackup = Directory.GetLastWriteTime(ToLocalPath("backup"));
            if (DateTime.Now - lastBackup > Security.BackupInterval)
            {
                Backup();
            }
        }

        [NonAction]
        public void Backup()
        {
            List<Person> allPersons = Storage.Persons.ToList();
            List<Operation> allOperations = Storage.Operations.ToList();
            var set = new EntitySet() { Persons = allPersons, Operations = allOperations };

            var snapshot = Serializer.ToXml(set);
            var fileName = String.Format("backup/{0}.xml",
                DateTime.Now.ToString("F", Helper.BackupTimeFormat));
            snapshot.Save(ToLocalPath(fileName));
        }

        [NonAction]
        public void Restore(string name)
        {
            // Always backup before restoring from backup
            Backup();
            // loading entities from backup
            string path = ToLocalPath(String.Format("backup/{0}.xml", name));
            XDocument doc = XDocument.Load(path);
            EntitySet set = Serializer.FromXml(doc);
            // clearing database
            List<Person> allPersons = Storage.Persons.ToList();
            List<Operation> allOperations = Storage.Operations.ToList();
            foreach (Operation op in allOperations)
                Storage.Operations.Remove(op);
            foreach (Person man in allPersons)
                Storage.Persons.Remove(man);
            // filling database
            foreach (Person man in set.Persons)
                Storage.Persons.Add(man);
            foreach (Operation op in set.Operations)
                Storage.Operations.Add(op);
            Storage.SaveChanges();
        }

        [NonAction]
        protected string ToLocalPath(string path)
        {
            return Path.Combine(AppDomain.CurrentDomain.BaseDirectory, path);
        }
    }
}
