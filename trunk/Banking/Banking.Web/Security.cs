using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Banking.Web
{
    public static class Security
    {
        public static string Key { get { return "f6e0a1e2ac41945a9aa7ff8a8aaa0cebc12a3bcc981a929ad5cf810a090e11ae"; } }
        public static TimeSpan Timeout { get { return TimeSpan.FromMinutes(1); } }
    }
}