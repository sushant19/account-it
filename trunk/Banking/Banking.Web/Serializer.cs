using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using System.Text;
using System.Globalization;

using Banking.Domain;

namespace Banking.Web
{
    public class Serializer
    {
        public static XDocument ToXml(EntitySet set)
        {
            var persons = new XElement("persons");
            foreach (Person man in set.Persons)
                persons.Add(SerializePerson(man));

            var operations = new XElement("operations");
            foreach (Operation op in set.Operations)
                operations.Add(SerializeOperation(op));

            return new XDocument(
                new XElement("snapshot", persons, operations));
        }

        private static XElement SerializePerson(Person man)
        {
            return
               new XElement("person",
                    new XAttribute("id", man.ID.ToString(NumberFormatInfo.InvariantInfo)),
                    new XAttribute("name", man.Name),
                    new XAttribute("operations", ListIds(man.Operations)));
        }

        private static XElement SerializeOperation(Operation op)
        {
            return
                new XElement("operation",
                    new XAttribute("id", op.ID.ToString(NumberFormatInfo.InvariantInfo)),
                    new XAttribute("amount", op.Amount.ToString(NumberFormatInfo.InvariantInfo)),
                    new XAttribute("date", op.Date.ToString(DateTimeFormatInfo.InvariantInfo)),
                    new XAttribute("description", op.Description ?? ""),
                    new XAttribute("mark", op.Mark ?? ""),
                    new XAttribute("participants", ListIds(op.Participants)));
        }

        public static EntitySet FromXml(XDocument doc)
        {
            XElement snapshot = doc.Root;
            var persons = snapshot.Element("persons").Elements("person");
            var operations = snapshot.Element("operations").Elements("operation");

            var set = new EntitySet()
                { Persons = new List<Person>(), Operations = new List<Operation>() };
            // parsing entities, ignoring relationships
            foreach (XElement man in persons)
                set.Persons.Add(ParsePerson(man));
            foreach (XElement op in operations)
                set.Operations.Add(ParseOperation(op));
            // filling Person.Operations
            foreach (Person man in set.Persons)
            {
                XElement raw = persons.Single(el => el.Attribute("id").Value == man.ID.ToString());
                int[] operationIds = FromCsv(raw.Attribute("operations").Value);
                foreach (int id in operationIds)
                    man.Operations.Add(set.Operations.Single(op => op.ID == id));
            }
            // filling Operation.Participants
            foreach (Operation op in set.Operations)
            {
                XElement raw = operations.Single(el => el.Attribute("id").Value == op.ID.ToString());
                int[] personIds = FromCsv(raw.Attribute("participants").Value);
                foreach (int id in personIds)
                    op.Participants.Add(set.Persons.Single(man => man.ID == id));
            }
            return set;
        }

        private static Person ParsePerson(XElement xml)
        {
            return new Person()
            {
                ID = Convert.ToInt32(xml.Attribute("id").Value, NumberFormatInfo.InvariantInfo),
                Name = xml.Attribute("name").Value,
                Operations = new List<Operation>()
            };
        }

        private static Operation ParseOperation(XElement xml)
        {
            return new Operation()
            {
                ID = Convert.ToInt32(xml.Attribute("id").Value, NumberFormatInfo.InvariantInfo),
                Amount = Convert.ToDecimal(xml.Attribute("amount").Value, NumberFormatInfo.InvariantInfo),
                Date = Convert.ToDateTime(xml.Attribute("date").Value, DateTimeFormatInfo.InvariantInfo),
                Description = xml.Attribute("description").Value,
                Mark = xml.Attribute("mark").Value,
                Participants = new List<Person>()
            };
        }

        // converts entity collection to csv string with ids
        protected static string ListIds(IEnumerable<EntityBase> entities)
        {
            return ToCsv(entities
                .Select(e => e.ID).ToArray());
        }

        protected static string ToCsv(int[] numbers)
        {
            StringBuilder builder = new StringBuilder();
            foreach (int n in numbers)
                builder.Append(n.ToString(NumberFormatInfo.InvariantInfo)).Append(',');
            return builder.ToString().TrimEnd(',');
        }

        protected static int[] FromCsv(string str)
        {
            if (str != "")      
                return str.Split(',')
                    .Select(s => Int32.Parse(s, NumberFormatInfo.InvariantInfo)).ToArray();          
            else           
                return new int[0];            
        }
    }
}