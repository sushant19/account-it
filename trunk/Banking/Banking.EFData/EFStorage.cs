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

        public DbSet<T> GetDbSet<T>() where T: EntityBase
        {
            string typeName = typeof(T).Name;
            switch (typeName)
            {
                case "Operation":
                    return Operations as DbSet<T>;
                case "Person":
                    return Persons as DbSet<T>;
                case "Session":
                    return Sessions as DbSet<T>;
                default:
                    throw new ArgumentException("Unknown type: " + typeName);
            }
        }

        public T ReadOrCreate<T>(int? id) where T: EntityBase, new()
        {
            T entity = null;
            DbSet<T> dbs = GetDbSet<T>();
            if (id != null && id != 0)
                entity = dbs.Find(id);
            if (entity == null)
            {
                entity = new T();
                dbs.Add(entity);
            }
            return entity;
        }
    }
}
