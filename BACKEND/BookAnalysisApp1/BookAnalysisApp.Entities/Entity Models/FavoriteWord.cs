using System;

namespace BookAnalysisApp.Entities
{
    public class FavoriteWord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Kapcsolat a felhasználóval
        public string UserId { get; set; }
        // Removing direct reference to AppUser to avoid circular dependencies
        
        // Kapcsolat a szótári bejegyzéssel
        public Guid DictionaryEntryId { get; set; }
        public EnglishHungarianPhrase DictionaryEntry { get; set; }
        
        // Időbélyeg
        public DateTimeOffset AddedAt { get; set; }
    }
}
