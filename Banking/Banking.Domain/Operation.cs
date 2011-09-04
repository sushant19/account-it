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

        public Operation Init(DateTime date, Decimal amount,
            string mark, string description)
        {
            Date = date;
            Amount = amount;
            Mark = mark;
            Description = description;
            return this;
        }

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

        public string GetTitle()
        {
            if (!String.IsNullOrWhiteSpace(Description))           
                return Description;            
            else if (!String.IsNullOrWhiteSpace(Mark))
                return Mark;
            else
                return "deal #" + ID;
        }

        public Decimal GetPersonShare()
        {
            return Amount / Participants.Count;
        }
    }
}
