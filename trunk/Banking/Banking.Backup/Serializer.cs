using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using System.Text;
using System.Globalization;

using Banking.Domain;

namespace Banking.Backup
{
    //TODO: Refactor "magic strings" in Backup.Serializer
    public class Serializer
    {
        private static NumberFormatInfo NumberFormat = NumberFormatInfo.InvariantInfo;
        private static DateTimeFormatInfo DateTimeFormat = DateTimeFormatInfo.InvariantInfo;

        public static XDocument ToXml(Snapshot set)
        {
            var info = new XElement("info",
                new XAttribute("mark", set.Mark),
                new XAttribute("time", set.Time.ToString(DateTimeFormat)),
                new XAttribute("operationsCount", set.Operations.Count.ToString(NumberFormat)),
                new XAttribute("personsCount", set.Persons.Count.ToString(NumberFormat)));

            var persons = new XElement("persons");
            foreach (Person man in set.Persons)
                persons.Add(SerializePerson(man));

            var operations = new XElement("operations");
            foreach (Operation op in set.Operations)
                operations.Add(SerializeOperation(op));

            return new XDocument(
                new XElement("snapshot", info, persons, operations));
        }

        private static XElement SerializePerson(Person man)
        {
            return
               new XElement("person",
                    new XAttribute("id", man.ID.ToString(NumberFormat)),
                    new XAttribute("name", man.Name),
                    new XAttribute("operations", ListIds(man.Operations)));
        }

        private static XElement SerializeOperation(Operation op)
        {
            return
                new XElement("operation",
                    new XAttribute("id", op.ID.ToString(NumberFormat)),
                    new XAttribute("amount", op.Amount.ToString(NumberFormat)),
                    new XAttribute("date", op.Date.ToString(DateTimeFormat)),
                    new XAttribute("description", op.Description ?? ""),
                    new XAttribute("mark", op.Mark ?? ""),
                    new XAttribute("participants", ListIds(op.Participants)));
        }

        public static SnapshotInfo ParseInfo(XDocument doc)
        {
            var info = doc.Root.Element("info");
            return new SnapshotInfo()
            {
                Mark = info.Attribute("mark").Value,
                Time = DateTime.Parse(info.Attribute("time").Value, DateTimeFormat),
                OperationsCount = Int32.Parse(info.Attribute("operationsCount").Value, NumberFormat),
                PersonsCount = Int32.Parse(info.Attribute("personsCount").Value, NumberFormat)
            };
        }

        // makes Snapshot from XML document with following structure:
        //
        //<snapshot>
        //  <info ... />
        //  <persons>
        //      <person ... />
        //      ...
        //  </persons>
        //  <operations>
        //      <operation ... />
        //      ...
        //  </operations>
        //
        public static Snapshot FromXml(XDocument doc)
        {
            // retrieving nodes
            var persons = doc.Root.Element("persons").Elements("person");
            var operations = doc.Root.Element("operations").Elements("operation");
            // initializing snapshot
            var info = ParseInfo(doc);
            var snapshot = new Snapshot(info);
            // parsing entities, ignoring relationships for now
            foreach (XElement man in persons)
                snapshot.Persons.Add(ParsePerson(man));
            foreach (XElement op in operations)
                snapshot.Operations.Add(ParseOperation(op));
            // filling Person.Operations
            foreach (Person man in snapshot.Persons)
            {
                XElement raw = persons.Single(el => el.Attribute("id").Value == man.ID.ToString());
                int[] operationIds = FromCsv(raw.Attribute("operations").Value);
                foreach (int id in operationIds)
                    man.Operations.Add(snapshot.Operations.Single(op => op.ID == id));
            }
            // filling Operation.Participants
            foreach (Operation op in snapshot.Operations)
            {
                XElement raw = operations.Single(el => el.Attribute("id").Value == op.ID.ToString());
                int[] personIds = FromCsv(raw.Attribute("participants").Value);
                foreach (int id in personIds)
                    op.Participants.Add(snapshot.Persons.Single(man => man.ID == id));
            }
            return snapshot;
        }

        // makes Person from xml node
        private static Person ParsePerson(XElement xml)
        {
            return new Person()
            {
                ID = Convert.ToInt32(xml.Attribute("id").Value, NumberFormat),
                Name = xml.Attribute("name").Value,
                Operations = new List<Operation>()
            };
        }

        // makes Operation from xml node
        private static Operation ParseOperation(XElement xml)
        {
            return new Operation()
            {
                ID = Convert.ToInt32(xml.Attribute("id").Value, NumberFormat),
                Amount = Convert.ToDecimal(xml.Attribute("amount").Value, NumberFormat),
                Date = Convert.ToDateTime(xml.Attribute("date").Value, DateTimeFormat),
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

        // makes CSV string from array, e.g. "1,23,4,567"
        protected static string ToCsv(int[] numbers)
        {
            StringBuilder builder = new StringBuilder();
            foreach (int n in numbers)
                builder.Append(n.ToString(NumberFormat)).Append(',');
            return builder.ToString().TrimEnd(',');
        }

        // makes array form CSV string
        protected static int[] FromCsv(string str)
        {
            if (str != "")
                return str.Split(',')
                    .Select(s => Int32.Parse(s, NumberFormat)).ToArray();
            else
                return new int[0];
        }
    }
}