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
    public class OperationController : EntityController<Operation>
    {

        public ViewResult AllOperations()
        {
            return View("AllOperations", Storage.Operations.ToList());
        }

        [HttpPost]
        public ActionResult ViewOperation(int id)
        {
            return GetView("ViewOperation", id);
        }

        public ActionResult ViewTitleOperation(int id)
        {
            return GetView("ViewOperationTitle", id);
        }

        public ActionResult ViewPersonalOperation(int id, int ownerId)
        {
            Operation op = Storage.Operations.Find(id);
            Person owner = Storage.Persons.Find(ownerId);
            Func<Operation, Person, bool> opHasParticipant
                = (o, man) => o.Participants.Any(p => p.ID == man.ID);
            if (op == null || owner == null || !opHasParticipant(op, owner))
                return new EmptyResult();
            var personalOp = new PersonalOperation() { Owner = owner }.Init(op);
            return PartialView("ViewPersonalOperation", personalOp);
        }

        [HttpPost]
        public ActionResult EditOperation(int id)
        {
            return GetView("EditOperation", id);
        }

        [HttpPost]
        public ActionResult SaveOperation(int? id, DateTime date,
            decimal amount, string mark, string description, int[] participants, int? ownerId)
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
            return Json(new { id = op.ID });
        }

        [HttpPost]
        public PartialViewResult CreateOperation()
        {
            Operation op = new Operation();
            op.Date = DateTime.Today;
            return PartialView("EditOperation", op);
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
