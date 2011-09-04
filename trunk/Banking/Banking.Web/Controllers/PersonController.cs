using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Entity;

using Banking.Domain;
using Banking.EFData;

namespace Banking.Web.Controllers
{
    [SessionState(System.Web.SessionState.SessionStateBehavior.Disabled)]
    //[RequireHttps]
    [RequireSecurityCode]
    public class PersonController : EntityController<Person>
    {
        // person cannot have any of these names
        private string[] ReservedNames = { "operations", "persons", "backups" };

        public ViewResult All()
        {
            return View("AllPersons", Storage.Persons.ToList());
        }

        public ActionResult View(int id)
        {
            return GetView("ViewPerson", id);
        }

        public ActionResult ViewHeading(int id)
        {
            return GetView("ViewHeading", id);
        }

        public ActionResult ViewHistory(string name)
        {
            Person man = Storage.Persons.
                SingleOrDefault(p => p.Name == name);
            if (man != null)
                return View("ViewHistory", man);
            else
                return new EmptyResult();
        }

        [HttpPost]
        public ActionResult Edit(int id)
        {
            return GetView("EditPerson", id);
        }

        [HttpPost]
        public ActionResult Save(int? id, string name)
        {
            // trying to retrive or creating new if null id
            var man = Storage.ReadOrCreate<Person>(id);
            // new persons with equal names not allowed
            if (id == null && Storage.Persons.SingleOrDefault(p => p.Name == name) != null)
                return Error("PersonWithSameNameAlreadyExists");
            // person cannot have any of reserved names
            if (ReservedNames.Contains(name.ToLower()))
                return Error("PersonCannotHaveReservedName");
            BackupIfNecessary("!auto: Saved person: " + man.Name);
            // updating
            man.Name = name;
            Storage.SaveChanges();
            // given person is the only affected entity
            var affectedPersons = new List<Person>();
            affectedPersons.Add(man);
            var affectedData = affectedPersons
                .Select(p => new { entity = "person", id = p.ID }).ToList();
            return Json(new { affected = affectedData });
        }

        [HttpPost]
        public PartialViewResult Create()
        {
            Person man = new Person();
            return PartialView("EditPerson", man);
        }

        [HttpPost]
        public ActionResult Delete(int id)
        {
            Person man = Storage.Persons.Find(id);
            if (man != null)
            {
                // deleting person with operations not allowed
                if (man.Operations != null && man.Operations.Count > 0)
                    return Error("CannotDeletePersonThatHasOperations");
                BackupIfNecessary("!auto: Deleted person: " + man.Name);
                Storage.Persons.Remove(man);
                Storage.SaveChanges();
                return Json(new { id = id });
            }
            else
                return Error("PersonNotFound");
        }
    }
}
