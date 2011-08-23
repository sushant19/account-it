using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Banking.Domain
{
    public class EntitySet
    {
        public virtual List<Person> Persons { get; set; }
        public virtual List<Operation> Operations { get; set; }
    }
}
