using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Banking.Web.Controllers
{
    [SessionState(System.Web.SessionState.SessionStateBehavior.Required)]
    public class HomeController : Controller
    {
        //
        // GET: /Home/

        public HomeController()
        {
            //Session.Timeout = 20;
        }

        public ViewResult EnterCode()
        {
            return View("EnterCode");
        }

        [HttpPost]
        public ActionResult EnterCode(string code)
        {
            var p = Request.Params;
            if (code == Security.Key.ToString())
            {
                Session["Key"] = code;
                return Json(new { Success = true });
            }
            else
                return Json(new { Success = false });
        }

        public RedirectToRouteResult Redirect()
        {
            return new RedirectToRouteResult("AllOperations", null);
        }

    }
}
