using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Banking.Domain
{
    public abstract class EntityBase
    {
        public int ID { get; set; }

        public override bool Equals(object obj)
        {
            if (obj is EntityBase)
                return ID == (obj as EntityBase).ID;
            else
                return false;
        }

        public override int GetHashCode()
        {
            return ID.GetHashCode();
        }
    }

}
