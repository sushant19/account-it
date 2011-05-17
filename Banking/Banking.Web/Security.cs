using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Banking.Web
{
    public static class Security
    {
        public static string Key { get { return "111"; } }
        public static TimeSpan Timeout { get { return TimeSpan.FromMinutes(1); } }
    }
}