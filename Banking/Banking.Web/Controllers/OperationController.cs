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
    public class OperationController : Controller
    {
        private EFStorage _storage = new EFStorage();

        public OperationController()
        {
           Database.SetInitializer(new DropCreateDatabaseIfModelChanges<EFStorage>());
           _storage.Database.Connection.ConnectionString =
                @"data source=.\SQLEXPRESS;Integrated Security=SSPI;Initial Catalog=Banking21";
        }

        //[RequireHttps]
        public ViewResult AllOperations()
        {
            return View(_storage.Operations.ToList());
        }

        [HttpPost]
        public ActionResult ViewOperation(int id)
        {
            Operation operation = _storage.Operations.Find(id);
            if (operation != null)
                return ViewOperation(operation);
            else
                return new EmptyResult();
        }

        public PartialViewResult ViewOperation(Operation op)
        {
            return PartialView("ViewOperation", op);
        }

        [HttpPost]
        public ActionResult EditOperation(int id)
        {
            Operation operation = _storage.Operations.Find(id);
            if (operation != null)
                return EditOperation(operation);
            else
                return new EmptyResult();
        }

        public PartialViewResult EditOperation(Operation op)
        {
            return PartialView("EditOperation", op);
        }

        [HttpPost]
        //[RequireHttps]
        public PartialViewResult SaveOperation()
        {
            
            int opId = Convert.ToInt32(Request.Params["ID"]);
            Operation op = _storage.Operations.Find(opId);
            if (op == null)
            {
                op = new Operation();
                _storage.Operations.Add(op);
            }
            op.Date = Convert.ToDateTime(Request.Params["Date"]);
            op.Amount = Convert.ToDecimal(Request.Params["Amount"]);
            op.Mark = Request.Params["Mark"];
            op.Description = Request.Params["Description"];
            if (op.Participants == null)
                op.Participants = new List<Person>();
            else
                op.Participants.Clear();
            string people = Request.Params["Participants[]"];
            if (people != null)
            {
                var ids = Request.Params["Participants[]"].
                    Split(',').Select(str => Convert.ToInt32(str));
                foreach (int id in ids)
                {
                    Person person = _storage.Persons.Find(id);
                    if (person != null)
                        op.Participants.Add(person);
                }
            }
            _storage.SaveChanges();
            return PartialView("ViewOperation", op);
        }

        [HttpPost]
        public PartialViewResult CreateOperation()
        {
            Operation op = new Operation();
            op.ID = Int32.MaxValue;
            op.Date = DateTime.Today;
            return EditOperation(op);
        }

        [HttpPost]
        //[RequireHttps]
        public EmptyResult DeleteOperation(int id)
        {
            Operation op = _storage.Operations.Find(id);
            if (op != null)
            {
                _storage.Operations.Remove(op);
                _storage.SaveChanges();
            }
            return new EmptyResult();
        }

        public ActionResult SelectParticipants(int id)
        {
            Operation op = _storage.Operations.Find(id);
            if (op != null)
            {
                var selection = _storage.Persons.
                    ToList().
                        ToDictionary(man => man, man => op.Participants.
                            Any(p => p.Name == man.Name));
                return PartialView("SelectParticipants", selection);
            }
            else
            {
                return new EmptyResult();
            }
        }
    }
}
