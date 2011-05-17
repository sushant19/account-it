using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Banking.Domain
{
    public class Session: EntityBase
    {
        public Guid SessionId { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
