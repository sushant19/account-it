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
        public EFStorage()
        {
            System.Data.Entity.Database.SetInitializer(new DropCreateDatabaseIfModelChanges<EFStorage>());
            this.Database.Connection.ConnectionString =
                 @"data source=.\SQLEXPRESS;Integrated Security=SSPI;Initial Catalog=Banking";
        }

        public DbSet<Operation> Operations { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Session> Sessions { get; set; }
    }
}
