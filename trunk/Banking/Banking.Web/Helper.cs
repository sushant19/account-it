using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Globalization;

using Banking.Domain;

namespace Banking.Web
{
    public static class Helper
    {
        public static string DecimalFormat { get { return "G29"; } }

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
                var formatInfo = new DateTimeFormatInfo();
                formatInfo.FullDateTimePattern = "yyyy/MM/dd_HH/mm/ss";
                formatInfo.DateSeparator = "-";
                formatInfo.TimeSeparator = "-";
                return formatInfo;
            }
        }

        public static string GetTitle(this Operation op)
        {
            if (String.IsNullOrEmpty(op.Mark))
                return "deal #" + op.ID;
            else
                return op.Mark;
        }

    }
}