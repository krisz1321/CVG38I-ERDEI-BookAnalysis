using BookAnalysisApp.Data;
using BookAnalysisApp.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : IdentityDbContext<AppUser>
{    public DbSet<Book> Books { get; set; }
    public DbSet<EnglishPhrase> EnglishPhrases { get; set; }
    public DbSet<BookPhrase> BookPhrases { get; set; }
    public DbSet<EnglishHungarianPhrase> EnglishHungarianPhrases { get; set; }
    public DbSet<WordFrequency> WordFrequencies { get; set; }
    
    // Új entitások
    public DbSet<LearnedWord> LearnedWords { get; set; }
    public DbSet<FavoriteWord> FavoriteWords { get; set; }
    public DbSet<UserLoginRecord> LoginHistory { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configuring the Many-to-Many relationship
        modelBuilder.Entity<BookPhrase>()
            .HasKey(bp => new { bp.BookId, bp.EnglishPhraseId });

        modelBuilder.Entity<BookPhrase>()
            .HasOne(bp => bp.Book)
            .WithMany(b => b.BookPhrases)
            .HasForeignKey(bp => bp.BookId);

        modelBuilder.Entity<BookPhrase>()
            .HasOne(bp => bp.EnglishPhrase)
            .WithMany(ep => ep.BookPhrases)
            .HasForeignKey(bp => bp.EnglishPhraseId);
            
        // Add a composite index on BookId and Frequency for faster querying and sorting
        modelBuilder.Entity<BookPhrase>()
            .HasIndex(bp => new { bp.BookId, bp.Frequency })
            .HasName("IX_BookPhrases_BookId_Frequency");        // LearnedWord konfigurációja
        modelBuilder.Entity<LearnedWord>()
            .HasOne<AppUser>()
            .WithMany(u => u.LearnedWords)
            .HasForeignKey(lw => lw.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LearnedWord>()
            .HasOne(lw => lw.DictionaryEntry)
            .WithMany()
            .HasForeignKey(lw => lw.DictionaryEntryId)
            .OnDelete(DeleteBehavior.Restrict);        // FavoriteWord konfigurációja
        modelBuilder.Entity<FavoriteWord>()
            .HasOne<AppUser>()
            .WithMany(u => u.FavoriteWords)
            .HasForeignKey(fw => fw.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<FavoriteWord>()
            .HasOne(fw => fw.DictionaryEntry)
            .WithMany()
            .HasForeignKey(fw => fw.DictionaryEntryId)
            .OnDelete(DeleteBehavior.Restrict);        // UserLoginRecord konfigurációja
        modelBuilder.Entity<UserLoginRecord>()
            .HasOne<AppUser>()
            .WithMany(u => u.LoginHistory)
            .HasForeignKey(lr => lr.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Identity model configurations
        base.OnModelCreating(modelBuilder);
    }
}
