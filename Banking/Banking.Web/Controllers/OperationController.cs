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

        public ViewResult All()
        {
            return View("AllOperations", Storage.Operations.ToList());
        }

        [HttpPost]
        public ActionResult View(int id)
        {
            return GetView("ViewOperation", id);
        }

        public ActionResult ViewTitle(int id)
        {
            return GetView("ViewOperationTitle", id);
        }

        public ActionResult ViewPersonal(int id, int ownerId)
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
        public ActionResult Edit(int id)
        {
            return GetView("EditOperation", id);
        }

        [HttpPost]
        public ActionResult Save(int? id, DateTime date, decimal amount,
            string mark, string description, int[] participants)
        {
            // operation should have at least one participant
            if (participants == null || participants.Length == 0)
                return Json(new { error = "EmptyParticipantsList" });
            
            Operation op = Storage.ReadOrCreate<Operation>(id)
                .Init(date, amount, mark, description);

            if (op.Participants == null)
                op.Participants = new List<Person>();

            var newParticipants = participants
                .Select(pid => Storage.Persons.Find(pid))
                    .Where(p => p != null);

            var affectedPersons = op.Participants
                .Union(newParticipants)
                .Except(op.Participants
                    .Intersect(newParticipants));

            op.Participants = newParticipants.ToList();
            Storage.SaveChanges(); 

            var affectedData = affectedPersons
                .Select(p => new { entity = "person", id = p.ID }).ToList();
            affectedData.Add(new { entity = "operation", id = op.ID });


            return Json(affectedData);
        }

        [HttpPost]
        public PartialViewResult Create()
        {
            Operation op = new Operation();
            op.Date = DateTime.Today;
            return PartialView("EditOperation", op);
        }

        [HttpPost]
        public JsonResult Delete(int id)
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
