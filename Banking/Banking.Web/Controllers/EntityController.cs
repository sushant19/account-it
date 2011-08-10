using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Banking.Domain;

namespace Banking.Web.Controllers
{
    public class EntityController<T> : BankingControllerBase where T: EntityBase
    {
        [HttpPost]
        public ActionResult GetView(string viewName, int id)
        {
            T entity = Storage.GetDbSet<T>().Find(id);
            if (entity != null)
                return PartialView(viewName, entity);
            else
                return new EmptyResult();
        }

        public PartialViewResult GetPartial(string viewName, T entity)
        {
            return PartialView(viewName, entity);
        }
    }
}
