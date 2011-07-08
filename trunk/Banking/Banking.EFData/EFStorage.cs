using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;

using Banking.Domain;

namespace Banking.EFData
{
    public class EFStorage: DbContext
    {
        public DbSet<Operation> Operations { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Session> Sessions { get; set; }
    }
}
