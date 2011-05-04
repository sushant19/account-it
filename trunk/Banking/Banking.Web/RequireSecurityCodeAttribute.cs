using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace Banking.Web
{
    public class RequireSecurityCodeAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var key = filterContext.HttpContext.Session["Key"];
            if (key == null || key.ToString() != Security.Key.ToString())
            {
                /*RouteValueDictionary redir = new RouteValueDictionary();
                redir.Add("action", "EnterCode");
                redir.Add("controller", "Home");*/
                filterContext.Result = new RedirectToRouteResult("EnterCode", null);
            }

        }
    }
}