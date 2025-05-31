using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookAnalysisApp.Entities;

namespace BookAnalysisApp.Data
{    public class AppUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        
        // Utolsó bejelentkezés időpontja
        public DateTimeOffset? LastLoginAt { get; set; }
        
        // Bejelentkezési előzmények
        public ICollection<UserLoginRecord> LoginHistory { get; set; } = new List<UserLoginRecord>();
        
        // Megtanult és kedvenc szavak
        public ICollection<LearnedWord> LearnedWords { get; set; } = new List<LearnedWord>();
        public ICollection<FavoriteWord> FavoriteWords { get; set; } = new List<FavoriteWord>();
    }
}
