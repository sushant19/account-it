using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Banking.Domain;

namespace Banking.Import
{
    public class ParseResult
    {
        public List<Operation> Operations { get; set; }
        public string TextLeft { get; set; }
    }
}
