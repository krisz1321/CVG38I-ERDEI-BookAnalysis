using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookAnalysisApp.Entities
{
    public class UserInputDto
    {
        public string UserName { get; set; }
        public string? FirstName { get; set; } = null;  // Opcionális (null-ra állítható)
        public string? LastName { get; set; } = null;   // Opcionális (null-ra állítható)
        public string Password { get; set; }
    }
}
