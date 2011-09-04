using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Banking.Domain;
using Banking.Backup;

namespace Banking.Web.Controllers
{
    public class BackupController : BankingControllerBase
    {
        public ViewResult All()
        {
            return View("AllBackups", Backuper.GetAllInfo());
        }

        public ActionResult View(long id) // id is actually number of ticks
        {
            DateTime time = new DateTime(id);
            if (Backuper.Exists(time))
                return PartialView("ViewBackup", Backuper.GetInfo(time));
            else
                return Error("BackupWithGivenTimeDoesNotExist");
        }

        public ActionResult Restore(long id)
        {
            DateTime time = new DateTime(id);
            if (Backuper.Exists(time))
            {
              
                // clearing DB
                Snapshot backup = Backuper.Load(time);
                Snapshot current = CreateSnapshot("!auto: Restored backup: " + backup.GetTitle());
                Backuper.Save(current); // making backup before restore
                foreach (Operation op in current.Operations)
                    Storage.Operations.Remove(op);
                foreach (Person man in current.Persons)
                    Storage.Persons.Remove(man);
                // filling DB
                foreach (Person man in backup.Persons)
                    Storage.Persons.Add(man);
                foreach (Operation op in backup.Operations)
                    Storage.Operations.Add(op);
                Storage.SaveChanges();
                return new EmptyResult();
            }
            else
                return Error("BackupWithGivenTimeDoesNotExist");
        }

        public ActionResult Create()
        {
            var info = new SnapshotInfo() { Mark = "" };
            return PartialView("EditBackup", info);
        }

        public ActionResult Edit(long id)
        {
            DateTime time = new DateTime(id);
            if (Backuper.Exists(time))
                return PartialView("EditBackup", Backuper.GetInfo(time));
            else
                return Error("BackupWithGivenTimeDoesNotExist");
        }

        public ActionResult Save(long? id, string mark) // id is actually number of ticks for DateTime
        {
            long realId;
            if (id == null || id == 0 || Backuper.NotExists(new DateTime(id.Value)))
            {
                Snapshot snapshot = CreateSnapshot(mark);
                Backuper.Save(snapshot);
                realId = snapshot.Time.Ticks;
            }
            else
            {
                Backuper.Rename(new DateTime(id.Value), mark);
                realId = id.Value;
            }
            var affected = new List<long>();
            affected.Add(realId);
            var affectedData = affected.Select(n => new { entity = "backup", id = n });
            return Json(new { affected = affectedData });
        }

        public ActionResult Delete(long id) // id is actually number of ticks
        {
            DateTime time = new DateTime(id);
            Backuper.Delete(time);
            return Json(new { id = id });
        }
        
    }
}
