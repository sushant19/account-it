using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using Banking.Domain;

namespace Banking.Web
{
    public static class EntityExtensions
    {
        public static string GetTitle(this Operation op)
        {
            if (String.IsNullOrEmpty(op.Mark))
                return "deal #" + op.ID;
            else
                return op.Mark;
        }
    }
}