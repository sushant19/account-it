using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Globalization;

using Banking.Domain;

namespace Banking.Web
{
    //TODO: Get rid of Web.Helper class
    public static class Helper
    {
        public static string DecimalFormat { get { return "G29"; } }

        public static NumberFormatInfo AmountFormat {
            get
            {
                return new NumberFormatInfo()
                {
                    NumberDecimalSeparator = ","
                };
            }
        }

        public static DateTimeFormatInfo DateFormat
        {
            get
            {
                var formatInfo = new DateTimeFormatInfo();
                formatInfo.ShortDatePattern = "dd/MM/yyyy";
                formatInfo.LongTimePattern = "";
                formatInfo.DateSeparator = ".";
                return formatInfo;
            }
        }

        public static DateTimeFormatInfo BackupTimeFormat
        {
            get
            {
                return new DateTimeFormatInfo()
                {
                    FullDateTimePattern = "yyyy/MM/dd HH/mm/ss",
                    DateSeparator = ".",
                    TimeSeparator = ":"
                };
            }
        }
    }
}