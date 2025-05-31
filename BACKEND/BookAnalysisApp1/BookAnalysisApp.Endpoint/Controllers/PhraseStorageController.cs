using BookAnalysisApp.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Text;
using System.Collections.Concurrent;

namespace BookAnalysisApp.Endpoint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PhraseStorageController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PhraseStorageController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("store")] // Method to analyze and store phrases
        public async Task<IActionResult> StoreBookPhrases(Guid bookId)
        {
            var stopwatch = Stopwatch.StartNew();

            var book = await _context.Books.FindAsync(bookId);
            if (book == null)
            {
                return NotFound("Book not found.");
            }

            // Retrieve all English phrases from the database
            var phrases = await _context.EnglishHungarianPhrases
                                        .Select(ehp => ehp.EnglishPhrase)
                                        .ToListAsync();

            // Calculate the word frequency for the English phrases
            var wordFrequencies = CalculateWordFrequency(book.Content, phrases);

            // Save the word frequency data to the database
            foreach (var wordGroup in wordFrequencies)
            {
                var englishPhrase = await _context.EnglishPhrases
                                                  .FirstOrDefaultAsync(ep => ep.Phrase == wordGroup.Key)
                                                  ?? new EnglishPhrase { Phrase = wordGroup.Key };

                // Megkeressük a szótári ID-t (EnglishHungarianPhrase.Id)
                var dictionaryEntryId = await _context.EnglishHungarianPhrases
                    .Where(ehp => ehp.EnglishPhrase == wordGroup.Key)
                    .Select(ehp => (Guid?)ehp.Id)
                    .FirstOrDefaultAsync();

                var bookPhrase = new BookPhrase
                {
                    BookId = book.Id,
                    Book = book,
                    EnglishPhrase = englishPhrase,
                    HungarianMeaning = _context.EnglishHungarianPhrases
                                               .Where(ehp => ehp.EnglishPhrase == wordGroup.Key)
                                               .Select(ehp => ehp.HungarianMeanings)
                                               .FirstOrDefault(),
                    Frequency = wordGroup.Value,
                    DictionaryEntryId = dictionaryEntryId // ÚJ: szótári ID mentése
                };

                _context.BookPhrases.Add(bookPhrase);
            }

            await _context.SaveChangesAsync();

            stopwatch.Stop();
            return Ok(new
            {
                Message = "Data stored successfully.",
                ElapsedTime = stopwatch.Elapsed.ToString(),
                BookTitle = book.Title,
                AnalyzedPhrases = wordFrequencies.Select(wf => new
                {
                    Phrase = wf.Key,
                    Frequency = wf.Value,
                    HungarianMeaning = _context.EnglishHungarianPhrases
                                               .Where(ehp => ehp.EnglishPhrase == wf.Key)
                                               .Select(ehp => ehp.HungarianMeanings)
                                               .ToList()
                })
            });
        }

        [HttpGet("retrieve")] // Method to retrieve stored data
        public async Task<IActionResult> RetrieveBookPhrases(Guid bookId)
        {
            var book = await _context.Books
                .Include(b => b.BookPhrases)
                    .ThenInclude(bp => bp.EnglishPhrase)
                .FirstOrDefaultAsync(b => b.Id == bookId);

            if (book == null)
            {
                return NotFound("Book not found.");
            }

            var phrases = book.BookPhrases.Select(bp => new
            {
                Phrase = bp.EnglishPhrase.Phrase,
                Frequency = bp.Frequency,
                HungarianMeaning = bp.HungarianMeaning
            });

            return Ok(new
            {
                BookTitle = book.Title,
                Phrases = phrases
            });
        }        [HttpGet("list")] // Method to list phrases with sorting options
        public async Task<IActionResult> ListBookPhrases(Guid bookId, string sortBy = "frequency", string order = "desc", int page = 1, int pageSize = 100)
        {
            // Validate the input parameters
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 1000) pageSize = 100;

            // Check if the book exists first without loading all data
            var bookExists = await _context.Books.AnyAsync(b => b.Id == bookId);
            if (!bookExists)
            {
                return NotFound("Book not found.");
            }
            // Get the book title separately - we only need this for the response
            var bookTitle = await _context.Books
                .Where(b => b.Id == bookId)
                .Select(b => b.Title)
                .FirstOrDefaultAsync();

            // Már nem kell JOIN, közvetlenül a BookPhrase-ből olvassuk ki az ID-t
            var query = _context.BookPhrases
                .Where(bp => bp.BookId == bookId)
                .Join(_context.EnglishPhrases,
                    bp => bp.EnglishPhraseId,
                    ep => ep.Id,
                    (bp, ep) => new
                    {
                        bp.Frequency,
                        bp.HungarianMeaning,
                        Phrase = ep.Phrase,
                        PhraseLength = ep.Phrase.Length,
                        Id = bp.DictionaryEntryId // közvetlenül a tárolt szótári ID
                    });

            // Apply sorting directly to the database query
            query = sortBy.ToLower() switch
            {
                "alphabetical" => order.ToLower() == "asc" ? query.OrderBy(x => x.Phrase) : query.OrderByDescending(x => x.Phrase),
                "length" => order.ToLower() == "asc" ? query.OrderBy(x => x.PhraseLength) : query.OrderByDescending(x => x.PhraseLength),
                _ => order.ToLower() == "asc" ? query.OrderBy(x => x.Frequency) : query.OrderByDescending(x => x.Frequency),
            };

            // Get the total count for paging information
            var totalCount = await query.CountAsync();

            // Apply paging - only get the data we need
            var phrases = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Return the paginated response
            return Ok(new
            {
                BookTitle = bookTitle,
                PageInfo = new {
                    CurrentPage = page,
                    PageSize = pageSize,
                    TotalItems = totalCount,
                    TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                },
                Phrases = phrases
            });
        }

        // ADMIN: Frissíti az összes BookPhrase rekordot, hogy a DictionaryEntryId mező ki legyen töltve
        [HttpPost("admin/fill-dictionary-ids")]
        public async Task<IActionResult> FillDictionaryEntryIds()
        {
            var phrases = await _context.BookPhrases
                .Include(bp => bp.EnglishPhrase)
                .ToListAsync();

            int updated = 0;
            foreach (var bp in phrases)
            {
                if (bp.DictionaryEntryId == null)
                {
                    var dictId = await _context.EnglishHungarianPhrases
                        .Where(ehp => ehp.EnglishPhrase == bp.EnglishPhrase.Phrase)
                        .Select(ehp => (Guid?)ehp.Id)
                        .FirstOrDefaultAsync();
                    if (dictId != null)
                    {
                        bp.DictionaryEntryId = dictId;
                        updated++;
                    }
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { Updated = updated });
        }

        // Helper function to calculate word frequency from book content and phrases
        private Dictionary<string, int> CalculateWordFrequency(string content, List<string> phrases)
        {
            var wordFrequency = new ConcurrentDictionary<string, int>();

            // Sort phrases by length in descending order
            var sortedPhrases = phrases.OrderByDescending(p => p.Length).ToList();

            // Use a HashSet for fast phrase lookup
            var phraseSet = new HashSet<string>(sortedPhrases.Select(p => p.ToLower()));

            // Split the content into smaller chunks for parallel processing
            var contentChunks = SplitContentIntoChunks(content.ToLower(), Environment.ProcessorCount);

            Parallel.ForEach(contentChunks, chunk =>
            {
                var chunkBuilder = new StringBuilder(chunk);

                foreach (var lowerPhrase in phraseSet)
                {
                    int count = 0;

                    // Count occurrences of the phrase in the chunk
                    int index = chunkBuilder.ToString().IndexOf(lowerPhrase);
                    while (index != -1)
                    {
                        count++;
                        if (index >= 0 && index + lowerPhrase.Length <= chunkBuilder.Length)
                        {
                            chunkBuilder.Remove(index, lowerPhrase.Length);
                        }
                        index = chunkBuilder.ToString().IndexOf(lowerPhrase);
                    }

                    if (count > 0)
                    {
                        wordFrequency.AddOrUpdate(lowerPhrase, count, (key, oldValue) => oldValue + count);
                    }
                }
            });

            return new Dictionary<string, int>(wordFrequency);
        }

        // Helper function to split content into smaller chunks
        private List<string> SplitContentIntoChunks(string content, int chunkCount)
        {
            var chunks = new List<string>();
            int chunkSize = content.Length / chunkCount;
            for (int i = 0; i < chunkCount; i++)
            {
                int start = i * chunkSize;
                int length = (i == chunkCount - 1) ? content.Length - start : chunkSize;
                chunks.Add(content.Substring(start, length));
            }
            return chunks;
        }
    }
}
