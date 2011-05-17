using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using System.Text;
using System.Security.Cryptography;

namespace Banking.Web
{
    public static class Security
    {
        static Security()
        {
            _key = HashOf("111");
        }
        private static string _key;
        
        public static string Key { get { return _key; } }
        public static TimeSpan Timeout { get { return TimeSpan.FromMinutes(1); } }

        private static string HashOf(string str)
        {
            var encoding = new UTF8Encoding();
            byte[] bytes = encoding.GetBytes(str);
            
            SHA256Managed sha = new SHA256Managed();
            byte[] hash = sha.ComputeHash(bytes);

            return BitConverter.ToString(hash).
                Split('-').
                    Aggregate("", (total, current) => total + current).
                        ToLower();
        }
    }
}