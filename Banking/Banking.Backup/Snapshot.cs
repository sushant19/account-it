using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Banking.Domain;

namespace Banking.Backup
{
    public class Snapshot: SnapshotBase
    {
        public Snapshot()
        {
            Operations = new List<Operation>();
            Persons = new List<Person>();
        }

        public Snapshot(SnapshotInfo info)
            :this()
        {
            Mark = info.Mark;
            Time = info.Time;
        }

        public List<Operation> Operations { get; set; }
        public List<Person> Persons { get; set; }
    }
}
