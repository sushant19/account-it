using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Banking.Domain
{
    public class PersonalOperation: Operation
    {
        public virtual Person Owner { get; set; }

        public PersonalOperation Init(Operation op)
        {
            Amount = op.Amount;
            this.Date = op.Date;
            this.Description = op.Description;
            this.ID = op.ID;
            this.Mark = op.Mark;
            this.Participants = op.Participants.ToList();
            return this;
        }

        public List<Person> Others
        {
            get
            {
                return Participants
                    .Where(man => man.ID != Owner.ID)
                        .ToList();
            }
        }
        
    }
}
