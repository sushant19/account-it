using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using Banking.Domain;

namespace Banking.EFData
{
    public class OldStorage<T> : DbContext where T: EntityBase
    {

        public DbSet<T> Entities { get; set; }

        public int NextId()
        {
            int maxId = Entities.ToList().Aggregate(0,
                (max, item) => item.ID > max ? item.ID : max);
            return maxId + 1;
        }

        public bool ContainsId(int id)
        {
            return Entities.Any(ent => ent.ID == id);
        }

        public T GetById(int id)
        {
            return Entities.Single(ent => ent.ID == id);
        }

        public List<T> GetAll()
        {
            return Entities.ToList();
        }

        public void Remove(T entity)
        {
            Entities.Attach(entity);
            Entities.Remove(entity);
            SaveChanges();
        }

        public void Save(T entity)
        {
            if (ContainsId(entity.ID))
                Remove(entity);
            Entities.Add(entity);
            SaveChanges();
        }

    }
}
