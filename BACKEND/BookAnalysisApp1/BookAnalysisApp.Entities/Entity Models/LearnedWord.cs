using System;

namespace BookAnalysisApp.Entities
{
    public class LearnedWord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Kapcsolat a felhasználóval
        public string UserId { get; set; }
        // Removing direct reference to AppUser to avoid circular dependencies
        
        // Kapcsolat a szótári bejegyzéssel
        public Guid DictionaryEntryId { get; set; }
        public EnglishHungarianPhrase DictionaryEntry { get; set; }
        
        // Időbélyegek
        public DateTimeOffset LearnedAt { get; set; }
        public DateTimeOffset LastClickedAt { get; set; }
    }
}
