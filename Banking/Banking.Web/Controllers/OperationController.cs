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
        public ActionResult GetView(string viewName, int id)
        {
            Operation op = Storage.Operations.Find(id);
            if (op != null)
                return GetView(viewName, op);
            else
                return new EmptyResult();   //TODO: Not found behavior
        }

        public PartialViewResult GetView(string viewName, Operation op)
        {
            return PartialView(viewName, op);
        }

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
        public ActionResult ViewOperationTitle(int id)
        {
            Operation operation = Storage.Operations.Find(id);
            if (operation != null)
                return ViewOperationTitle(operation);
            else
                return new EmptyResult();
        }

        public PartialViewResult ViewOperationTitle(Operation op)
        {
            return PartialView("ViewOperationTitle", op);
        }

        [HttpPost]
        public ActionResult GetAllViews(int id)
        {
            Operation operation = Storage.Operations.Find(id);
            if (operation != null)
                return GetAllViews(operation);
            else
                return new EmptyResult();
        }

        public PartialViewResult GetAllViews(Operation op)
        {
            return PartialView("AllViews", op);
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
        public ActionResult SaveOperation(int? id, DateTime date,
            decimal amount, string mark, string description, int[] participants)
        {

            // operation should have at least one participant
            if (participants == null || participants.Length == 0)
            {
                var result = Json(new { error = "EmptyParticipantsList" });
                string data = result.Data.ToString();
                return result;
            }

            var op = Storage.ReadOrCreate<Operation>(id);
            op.Date = date;
            op.Amount = amount;
            op.Mark = mark;
            op.Description = description;
            if (op.Participants == null)
                op.Participants = new List<Person>();
            else
                op.Participants.Clear();
            
            foreach (int pid in participants)
            {
                Person person = Storage.Persons.Find(pid);
                if (person != null)
                    op.Participants.Add(person);
            }
            
            Storage.SaveChanges();
            return PartialView("AllOperationViews", op);
        }

        [HttpPost]
        public PartialViewResult CreateOperation()
        {
            Operation op = new Operation();
            op.Date = DateTime.Today;
            return EditOperation(op);
        }

        [HttpPost]
        public JsonResult DeleteOperation(int id)
        {
            Operation op = Storage.Operations.Find(id);
            if (op != null)
            {
                Storage.Operations.Remove(op);
                Storage.SaveChanges();
            }
            return Json(new { id = id });
        }

        public PartialViewResult SelectParticipants(Operation op)
        {
            var allPersons = Storage.Persons.ToList();
            Func<Person, bool> selector;
            if (op.Participants != null)
                selector = man => op.Participants.Any(p => p.Name == man.Name);
            else
                selector = man => false;
            var participants = Storage.Persons.ToList().ToDictionary(man => man, selector);
            return PartialView("SelectParticipants", participants);
            
        }
    }
}
