using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Banking.Domain
{
    public class Operation: EntityBase
    {
        public DateTime Date { get; set; }
        public Decimal Amount { get; set; }
        public String Mark { get; set; }
        public String Description { get; set; }
        public virtual List<Person> Participants { get; set; }

        public string ListParticipants()
        {
            StringBuilder builder = new StringBuilder();
            if (Participants != null)
                foreach (var person in Participants)
                {
                    builder.Append(person.Name + ", ");
                }
            return builder.ToString().TrimEnd(' ', ',');
        }

        public Decimal GetPersonShare()
        {
            return Amount / Participants.Count;
        }

        //public Deci
    }
}
