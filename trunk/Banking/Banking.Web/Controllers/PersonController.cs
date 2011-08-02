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
    public class PersonController : BankingControllerBase
    {
        public ViewResult AllPersons()
        {
            return View(Storage.Persons.ToList());
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
        public ActionResult ViewPerson(int id)
        {
            Person person = Storage.Persons.Find(id);
            if (person != null)
                return ViewPerson(person);
            else
                return new EmptyResult();
        }

        public PartialViewResult ViewPerson(Person man)
        {
            return PartialView("ViewPerson", man);
        }

        [HttpPost]
        public ActionResult EditPerson(int id)
        {
            Person person = Storage.Persons.Find(id);
            if (person != null)
                return EditPerson(person);
            else
                return new EmptyResult();
        }

        public PartialViewResult EditPerson(Person man)
        {
            return PartialView("EditPerson", man);
        }

        [HttpPost]
        public ActionResult SavePerson(int? id, string name)
        {
            var man = Storage.ReadOrCreate<Person>(id);

            // persons with equal names not allowed
            var sameNamed = Storage.Persons.SingleOrDefault(p => p.Name == name);
            if (sameNamed != null)
            {
                return Json(new { error = "PersonWithSameNameAlreadyExists" });
            }

            man.Name = name;
            if (man.Operations == null)
                man.Operations = new List<Operation>();
            var ops = Storage.Operations.
                Where(op => op.Participants.
                    Any(p => p.Name == man.Name));
            foreach (Operation op in ops)
                man.Operations.Add(op);
            Storage.SaveChanges();
            return PartialView("ViewPerson", man);
        }

        [HttpPost]
        public PartialViewResult CreatePerson()
        {
            Person man = new Person();
            return EditPerson(man);
        }

        [HttpPost]
        public ActionResult DeletePerson(int id)
        {
            Person man = Storage.Persons.Find(id);
            if (man != null)
            {
                if (man.Operations != null && man.Operations.Count > 0)
                {
                    return Json(new { error = "CannotDeletePersonThatHasOperations" });
                }
                Storage.Persons.Remove(man);
                Storage.SaveChanges();
            }
            return new EmptyResult();
        }
    }
}
