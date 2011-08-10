using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Banking.Domain
{
    public class Person: EntityBase
    {
        public string Name { get; set; }

        public virtual List<Operation> Operations { get; set; }

        public decimal GetBalance()
        {
            if (Operations != null)
                // calculating sum of shares in all operations
                return Operations.Aggregate(0m, (balance, op) => balance += op.GetPersonShare());
            else
                return 0;
        }
    }
}
