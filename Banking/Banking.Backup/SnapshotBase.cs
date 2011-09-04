using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Globalization;

namespace Banking.Backup
{
    public abstract class SnapshotBase
    {
        public DateTime Time { get; set; }
        public string Mark { get; set; }

        public string GetTitle()
        {
            if (!String.IsNullOrWhiteSpace(Mark))
                return Mark;
            else
                return "Snapshot at " + Time.ToString(DateTimeFormatInfo.InvariantInfo);
        }
    }

}
