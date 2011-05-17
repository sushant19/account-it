using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Banking.Domain;
using Banking.EFData;

namespace Banking.Web.Controllers
{
    [SessionState(System.Web.SessionState.SessionStateBehavior.Disabled)]
    //[RequireHttps]
    public class HomeController : BankingControllerBase
    {
        public ViewResult EnterCode()
        {
            return View("EnterCode");
        }

        [HttpPost]
        public ActionResult EnterCode(string code)
        {
            if (code == Security.Key)
            {
                var session = new Session()
                { 
                    SessionId = Guid.NewGuid(),
                    ExpiresAt = DateTime.Now + Security.Timeout
                };
                Storage.Sessions.Add(session);
                Storage.SaveChanges();
                Response.Cookies.Add(new HttpCookie("account-it.SessionId", session.SessionId.ToString()));
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
