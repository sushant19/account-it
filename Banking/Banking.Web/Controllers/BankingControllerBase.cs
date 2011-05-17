﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using Banking.Domain;
using Banking.EFData;

namespace Banking.Web.Controllers
{
    public abstract class BankingControllerBase : Controller
    {
        protected EFStorage Storage = new EFStorage();

        [NonAction]
        private Session GetSession(string ssid)
        {
            var guid = new Guid(ssid); //yes, it's fucking dangerous, so what?!
            Session session = Storage.Sessions.
                SingleOrDefault(s => s.SessionId == guid);
            return session;
        }

        [NonAction]
        public bool IsValidSession(string ssid)
        {
            Session session = GetSession(ssid);
            if (session != null && session.ExpiresAt >= DateTime.Now)
                return true;
            else
                return false;

        }

        [NonAction]
        public void UpdateSession(string ssid)
        {
            Session session = GetSession(ssid);
            session.ExpiresAt = DateTime.Now + Security.Timeout;
            Storage.SaveChanges();
        }
    }
}