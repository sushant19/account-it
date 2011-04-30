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
    [SessionState(System.Web.SessionState.SessionStateBehavior.Required)]
    public class PersonController : Controller
    {
        private EFStorage _storage = new EFStorage();

        public PersonController()
        {
            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<EFStorage>());
            _storage.Database.Connection.ConnectionString =
                 @"data source=.\SQLEXPRESS;Integrated Security=SSPI;Initial Catalog=Banking21";
        }

        //[RequireHttps]
        [RequireSecurityCode]
        public ViewResult AllPersons()
        {
            return View(_storage.Persons.ToList());
        }

        [RequireSecurityCode]
        public ActionResult ViewHistory(int id)
        {
            Person man = _storage.Persons.Find(id);
            if (man != null)
                return View("ViewHistory", man);
            else
                return new EmptyResult();
        }

        [HttpPost]
        [RequireSecurityCode]
        public ActionResult ViewPerson(int id)
        {
            Person person = _storage.Persons.Find(id);
            if (person != null)
                return ViewPerson(person);
            else
                return new EmptyResult();
        }

        [RequireSecurityCode]
        public PartialViewResult ViewPerson(Person man)
        {
            return PartialView("ViewPerson", man);
        }

        [HttpPost]
        [RequireSecurityCode]
        public ActionResult EditPerson(int id)
        {
            Person person = _storage.Persons.Find(id);
            if (person != null)
                return EditPerson(person);
            else
                return new EmptyResult();
        }

        [RequireSecurityCode]
        public PartialViewResult EditPerson(Person man)
        {
            return PartialView("EditPerson", man);
        }

        [HttpPost]
        //[RequireHttps]
        [RequireSecurityCode]
        public PartialViewResult SavePerson()
        {

            int id = Convert.ToInt32(Request.Params["ID"]);
            Person man = _storage.Persons.Find(id);
            if (man == null)
            {
                man = new Person();
                _storage.Persons.Add(man);
            }
            man.Name = Request.Params["Name"];
            if (man.Operations == null)
                man.Operations = new List<Operation>();
            var ops = _storage.Operations.
                Where(op => op.Participants.
                    Any(p => p.Name == man.Name));
            foreach (Operation op in ops)
                man.Operations.Add(op);
            _storage.SaveChanges();
            return PartialView("ViewPerson", man);
        }

        [HttpPost]
        [RequireSecurityCode]
        public PartialViewResult CreatePerson()
        {
            Person man = new Person();
            man.ID = Int32.MaxValue;
            return EditPerson(man);
        }

        [HttpPost]
        //[RequireHttps]
        [RequireSecurityCode]
        public EmptyResult DeletePerson(int id)
        {
            Person man = _storage.Persons.Find(id);
            if (man != null)
            {
                _storage.Persons.Remove(man);
                _storage.SaveChanges();
            }
            return new EmptyResult();
        }
    }
}
