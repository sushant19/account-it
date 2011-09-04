using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Banking.Backup
{
    public class SnapshotInfo: SnapshotBase
    {
        public SnapshotInfo()
        { }

        public SnapshotInfo(Snapshot snapshot)
        {
            Time = snapshot.Time;
            Mark = snapshot.Mark;
            OperationsCount = snapshot.Operations.Count;
            PersonsCount = snapshot.Persons.Count;
        }

        public int OperationsCount { get; set; }
        public int PersonsCount { get; set; }
    }
}
