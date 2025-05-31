using System;

namespace BookAnalysisApp.Entities
{
    public class UserLoginRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Kapcsolat a felhasználóval
        public string UserId { get; set; }
        // Removing direct reference to AppUser to avoid circular dependencies
        
        // Bejelentkezés időpontja
        public DateTimeOffset LoginAt { get; set; }
    }
}
