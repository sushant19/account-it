using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Globalization;

using Banking.Domain;

namespace Banking.Import
{
    public class Parser
    {
        static Parser()
        {
            string template = _normalTemplate + "|" + _wrongTemplate;
            _operationRegex = MakeRegex(template);
        }

        private static Dictionary<string, string> _patterns = new Dictionary<string, string>()
        {
            { "date", @"\d{2}/\d{2}/\d{2}" },   // 00/00/00
            { "amount", @"-?\d+\.\d{2}" },      // {one or more digits}.{two digits}
            { "currency", @"[A-Z]{3}" },        // USD, EUR, AUD ...
            { "text", @".+" },                  // any char at least once
            { " ", @"\s+" }                     // one or more white space chars
        };

        private static string _normalTemplate =
            "(?<date>{date}){ }" +              // Date           
            "(?<mark>{text}){ }" +              // Mark
            "{text}{ }" +
            "{currency}{ }" +
            "{date}{ }" +
            "{amount}{ }" +
            "(?<amount>{amount})";              // Amount

        private static string _wrongTemplate =
            "{date}{ }" +                       // Second date sometimes appears here o_0
            "(?<date>{date}){ }" +              // Date           
            "(?<mark>{text}){ }" +              // Mark
            "{text}{ }" +
            "{currency}{ }" +
            "{amount}{ }" +
            "(?<amount>{amount})";              // Amount

        private static Regex _operationRegex;
        private static Regex _blankRegex = new Regex(@"(?:\s*\n\s*){2,}"); // 2 or more blank lines

        private static DateTimeFormatInfo DateFormat = new DateTimeFormatInfo()
        {
            ShortDatePattern = "dd/MM/yy",
            DateSeparator = "/"
        };

        private static NumberFormatInfo AmountFormat = new NumberFormatInfo()
        {
            CurrencyDecimalSeparator = "."
        };

        private static Regex MakeRegex(string template)
        {
            string pattern = template;
            foreach (var pair in _patterns)
                pattern = pattern.Replace('{' + pair.Key + '}', pair.Value);
            return new Regex(pattern);
        }
        
        public static ParseResult Parse(string text)
        {
            var result = new ParseResult() { Operations = new List<Operation>() };
            foreach (Match m in _operationRegex.Matches(text))
            {
                Func<string, string> groupValue =
                    groupName => m.Groups[groupName].Value.Trim();
                result.Operations.Add(new Operation()
                {
                    Amount = Decimal.Parse(groupValue("amount"), AmountFormat),
                    Date = DateTime.Parse(groupValue("date"), DateFormat),
                    Mark = groupValue("mark")
                });
            }
            // removing matched text and blank lines
            result.TextLeft = _blankRegex.Replace(_operationRegex.Replace(text, ""), "\n");
            return result;
        }
    }
}
