using System.ComponentModel.DataAnnotations.Schema;

namespace BookAnalysisApp.Entities
{
    public class Book
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } // New property added

        // Many-to-Many relationship
        public ICollection<BookPhrase> BookPhrases { get; set; } = new List<BookPhrase>();
    }
}
