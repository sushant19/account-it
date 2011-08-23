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
            _requireKey = true;
            _key = HashOf("Gfccrjlt");
            _sessionTimeout = TimeSpan.FromMinutes(10);
            _backupInterval = TimeSpan.FromMinutes(1);
        }

        private static bool _requireKey;
        private static string _key;
        private static TimeSpan _sessionTimeout;
        private static TimeSpan _backupInterval;

        public static bool RequireKey { get { return _requireKey; } }
        public static string Key { get { return _key; } }
        public static TimeSpan SessionTimeout { get { return _sessionTimeout; } }
        public static TimeSpan BackupInterval { get { return _backupInterval; } }

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