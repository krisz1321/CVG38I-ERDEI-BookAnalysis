using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BookAnalysisApp.Entities;
using BookAnalysisApp.Entities.Dtos.User;
using BookAnalysisApp.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BookAnalysisApp.Endpoint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Csak bejelentkezett felhasználók férhetnek hozzá
    public class UserWordsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserWordsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Segédfüggvény a felhasználó ID lekéréséhez a tokenből
        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        #region Megtanult szavak (LearnedWords)

        [HttpGet("learned")]
        public async Task<IActionResult> GetLearnedWords()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var learnedWords = await _context.LearnedWords
                .Where(lw => lw.UserId == userId)
                .Include(lw => lw.DictionaryEntry)
                .OrderByDescending(lw => lw.LastClickedAt)
                .Select(lw => new
                {
                    lw.Id,
                    lw.DictionaryEntryId,
                    EnglishPhrase = lw.DictionaryEntry.EnglishPhrase,
                    HungarianMeanings = lw.DictionaryEntry.HungarianMeanings,
                    lw.LearnedAt,
                    lw.LastClickedAt
                })
                .ToListAsync();

            return Ok(learnedWords);
        }        [HttpPost("learned")]
        public async Task<IActionResult> AddLearnedWord([FromBody] AddLearnedWordDto request)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            // Ellenőrizzük, hogy létezik-e a dictionary entry
            var dictionaryEntry = await _context.EnglishHungarianPhrases.FindAsync(request.DictionaryEntryId);
            if (dictionaryEntry == null)
            {
                return NotFound($"Dictionary entry with ID {request.DictionaryEntryId} not found.");
            }

            // Ellenőrzés, hogy már létezik-e ilyen megtanult szó
            var existingWord = await _context.LearnedWords
                .FirstOrDefaultAsync(lw => lw.UserId == userId && lw.DictionaryEntryId == request.DictionaryEntryId);

            // Ha már létezik, frissítjük a LastClickedAt időbélyeget
            if (existingWord != null)
            {
                existingWord.LastClickedAt = DateTimeOffset.UtcNow;
                _context.LearnedWords.Update(existingWord);
                await _context.SaveChangesAsync();
                return Ok(existingWord);
            }

            // Új megtanult szó hozzáadása
            var currentTime = DateTimeOffset.UtcNow;
            var learnedWord = new LearnedWord
            {
                UserId = userId,
                DictionaryEntryId = request.DictionaryEntryId,
                LearnedAt = currentTime,
                LastClickedAt = currentTime
            };

            _context.LearnedWords.Add(learnedWord);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLearnedWord), new { id = learnedWord.Id }, learnedWord);
        }

        [HttpGet("learned/{id}")]
        public async Task<IActionResult> GetLearnedWord(Guid id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var learnedWord = await _context.LearnedWords
                .Where(lw => lw.Id == id && lw.UserId == userId)
                .Include(lw => lw.DictionaryEntry)
                .Select(lw => new
                {
                    lw.Id,
                    lw.DictionaryEntryId,
                    EnglishPhrase = lw.DictionaryEntry.EnglishPhrase,
                    HungarianMeanings = lw.DictionaryEntry.HungarianMeanings,
                    lw.LearnedAt,
                    lw.LastClickedAt
                })
                .FirstOrDefaultAsync();

            if (learnedWord == null)
            {
                return NotFound($"Learned word with ID {id} not found for the current user.");
            }

            return Ok(learnedWord);
        }

        [HttpPut("learned/{id}/click")]
        public async Task<IActionResult> UpdateLearnedWordClick(Guid id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var learnedWord = await _context.LearnedWords
                .FirstOrDefaultAsync(lw => lw.Id == id && lw.UserId == userId);

            if (learnedWord == null)
            {
                return NotFound($"Learned word with ID {id} not found for the current user.");
            }

            // Frissítjük a LastClickedAt időbélyeget
            learnedWord.LastClickedAt = DateTimeOffset.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(learnedWord);
        }

        [HttpDelete("learned/{id}")]
        public async Task<IActionResult> DeleteLearnedWord(Guid id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var learnedWord = await _context.LearnedWords
                .FirstOrDefaultAsync(lw => lw.Id == id && lw.UserId == userId);

            if (learnedWord == null)
            {
                return NotFound($"Learned word with ID {id} not found for the current user.");
            }

            _context.LearnedWords.Remove(learnedWord);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        #endregion

        #region Kedvenc szavak (FavoriteWords)

        [HttpGet("favorites")]
        public async Task<IActionResult> GetFavoriteWords()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var favoriteWords = await _context.FavoriteWords
                .Where(fw => fw.UserId == userId)
                .Include(fw => fw.DictionaryEntry)
                .OrderByDescending(fw => fw.AddedAt)
                .Select(fw => new
                {
                    fw.Id,
                    fw.DictionaryEntryId,
                    EnglishPhrase = fw.DictionaryEntry.EnglishPhrase,
                    HungarianMeanings = fw.DictionaryEntry.HungarianMeanings,
                    fw.AddedAt
                })
                .ToListAsync();

            return Ok(favoriteWords);
        }        [HttpPost("favorites")]
        public async Task<IActionResult> AddFavoriteWord([FromBody] AddFavoriteWordDto request)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            // Ellenőrizzük, hogy létezik-e a dictionary entry
            var dictionaryEntry = await _context.EnglishHungarianPhrases.FindAsync(request.DictionaryEntryId);
            if (dictionaryEntry == null)
            {
                return NotFound($"Dictionary entry with ID {request.DictionaryEntryId} not found.");
            }

            // Ellenőrzés, hogy már létezik-e ilyen kedvenc szó
            var existingWord = await _context.FavoriteWords
                .FirstOrDefaultAsync(fw => fw.UserId == userId && fw.DictionaryEntryId == request.DictionaryEntryId);

            if (existingWord != null)
            {
                return Conflict($"Word with ID {request.DictionaryEntryId} is already in favorites.");
            }

            // Új kedvenc szó hozzáadása
            var favoriteWord = new FavoriteWord
            {
                UserId = userId,
                DictionaryEntryId = request.DictionaryEntryId,
                AddedAt = DateTimeOffset.UtcNow
            };

            _context.FavoriteWords.Add(favoriteWord);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFavoriteWord), new { id = favoriteWord.Id }, favoriteWord);
        }

        [HttpGet("favorites/{id}")]
        public async Task<IActionResult> GetFavoriteWord(Guid id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var favoriteWord = await _context.FavoriteWords
                .Where(fw => fw.Id == id && fw.UserId == userId)
                .Include(fw => fw.DictionaryEntry)
                .Select(fw => new
                {
                    fw.Id,
                    fw.DictionaryEntryId,
                    EnglishPhrase = fw.DictionaryEntry.EnglishPhrase,
                    HungarianMeanings = fw.DictionaryEntry.HungarianMeanings,
                    fw.AddedAt
                })
                .FirstOrDefaultAsync();

            if (favoriteWord == null)
            {
                return NotFound($"Favorite word with ID {id} not found for the current user.");
            }

            return Ok(favoriteWord);
        }

        [HttpDelete("favorites/{id}")]
        public async Task<IActionResult> DeleteFavoriteWord(Guid id)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var favoriteWord = await _context.FavoriteWords
                .FirstOrDefaultAsync(fw => fw.Id == id && fw.UserId == userId);

            if (favoriteWord == null)
            {
                return NotFound($"Favorite word with ID {id} not found for the current user.");
            }

            _context.FavoriteWords.Remove(favoriteWord);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        #endregion
    }    // A segédosztályokat áthelyeztük a UserWordDtos.cs fájlba
}
