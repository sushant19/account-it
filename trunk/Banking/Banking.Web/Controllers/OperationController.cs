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
    public class OperationController : BankingControllerBase
    {
        public ViewResult AllOperations()
        {
            return View(Storage.Operations.ToList());
        }

        [HttpPost]
        public ActionResult ViewOperation(int id)
        {
            Operation operation = Storage.Operations.Find(id);
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
            Operation operation = Storage.Operations.Find(id);
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
        public PartialViewResult SaveOperation()
        {
            int opId = Convert.ToInt32(Request.Params["ID"]);
            Operation op = Storage.Operations.Find(opId);
            if (op == null)
            {
                op = new Operation();
                Storage.Operations.Add(op);
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
                    Person person = Storage.Persons.Find(id);
                    if (person != null)
                        op.Participants.Add(person);
                }
            }
            Storage.SaveChanges();
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
        public EmptyResult DeleteOperation(int id)
        {
            Operation op = Storage.Operations.Find(id);
            if (op != null)
            {
                Storage.Operations.Remove(op);
                Storage.SaveChanges();
            }
            return new EmptyResult();
        }

        public ActionResult SelectParticipants(int id)
        {
            Operation op = Storage.Operations.Find(id);
            if (op != null)
            {
                var selection = Storage.Persons.
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
