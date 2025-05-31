using System;

namespace BookAnalysisApp.Entities.Dtos.User
{
    // Megtanult szó lekérdezése
    public class LearnedWordDto
    {
        public Guid Id { get; set; }
        public Guid DictionaryEntryId { get; set; }
        public string EnglishPhrase { get; set; }
        public string HungarianMeanings { get; set; }
        public DateTimeOffset LearnedAt { get; set; }
        public DateTimeOffset LastClickedAt { get; set; }
    }

    // Megtanult szó hozzáadása
    public class AddLearnedWordDto
    {
        public Guid DictionaryEntryId { get; set; }
    }

    // Kedvenc szó lekérdezése
    public class FavoriteWordDto
    {
        public Guid Id { get; set; }
        public Guid DictionaryEntryId { get; set; }
        public string EnglishPhrase { get; set; }
        public string HungarianMeanings { get; set; }
        public DateTimeOffset AddedAt { get; set; }
    }

    // Kedvenc szó hozzáadása
    public class AddFavoriteWordDto
    {
        public Guid DictionaryEntryId { get; set; }
    }
}
