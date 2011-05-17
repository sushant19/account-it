using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

using Banking.Web.Controllers;

namespace Banking.Web
{
    public class RequireSecurityCodeAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            HttpCookie cookie = filterContext.HttpContext.Request.Cookies["account-it.SessionId"];
            string ssid = cookie.Value;
            var controller = filterContext.Controller as BankingControllerBase;
            if (cookie == null || !controller.IsValidSession(ssid))
            {
                filterContext.Result = new RedirectToRouteResult("EnterCode", null);
            }
            else
            {
                controller.UpdateSession(ssid);
            }
        }
    }
}