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
            if (Security.RequireKey)
            {
                HttpCookie cookie = filterContext.HttpContext.Request.Cookies["account-it.SessionId"];
                var controller = filterContext.Controller as BankingControllerBase;
                if (cookie == null || !controller.IsValidSession(cookie.Value))
                {
                    if (filterContext.HttpContext.Request.IsAjaxRequest())
                    {
                        filterContext.Result = controller.Error("NotAuthorizedOrSessionExpired");
                    }
                    else
                    {
                        filterContext.Result = new RedirectToRouteResult("EnterCode", null);
                    }
                }
                else
                {
                    controller.UpdateSession(cookie.Value);
                }
            }
        }
    }
}