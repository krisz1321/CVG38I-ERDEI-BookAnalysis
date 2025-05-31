using BookAnalysisApp.Data;
using BookAnalysisApp.Entities;
using BookAnalysisApp.Entities.Dtos.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BookAnalysisApp.Endpoint.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;

        public UserController(
            UserManager<AppUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _context = context;
        }[HttpPost("register")]
        public async Task<IActionResult> Register(UserInputDto dto)
        {
            var user = new AppUser
            {
                UserName = dto.UserName,
                FirstName = dto.FirstName ?? string.Empty,  // Ha null, akkor üres string
                LastName = dto.LastName ?? string.Empty     // Ha null, akkor üres string
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Az első felhasználót adminisztrátorrá tesszük
            if (_userManager.Users.Count() == 1)
            {
                if (!await _roleManager.RoleExistsAsync("Admin"))
                {
                    await _roleManager.CreateAsync(new IdentityRole("Admin"));
                }
                await _userManager.AddToRoleAsync(user, "Admin");
            }

            return Ok(new UserViewDto
            {
                Id = user.Id,
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsAdmin = await _userManager.IsInRoleAsync(user, "Admin")
            });
        }        [HttpPost("login")]
        public async Task<IActionResult> Login(UserInputDto dto)
        {
            var user = await _userManager.FindByNameAsync(dto.UserName);
            if (user == null || !(await _userManager.CheckPasswordAsync(user, dto.Password)))
            {
                return Unauthorized("Invalid credentials.");
            }

            // Bejelentkezés időpontjának naplózása
            var currentTime = DateTimeOffset.UtcNow;
            
            // Utolsó bejelentkezés időpontjának frissítése
            user.LastLoginAt = currentTime;
            
            // Bejelentkezési napló bejegyzés létrehozása
            var loginRecord = new UserLoginRecord
            {
                UserId = user.Id,
                LoginAt = currentTime
            };
            
            // Adatbázisba mentés
            _context.LoginHistory.Add(loginRecord);
            await _userManager.UpdateAsync(user);
            await _context.SaveChangesAsync();

            // JWT Token generálása
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id)
            };

            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new LoginResultDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = token.ValidTo
            });
        }

        [HttpGet("grantadmin/{userid}")]
        //[Authorize(Roles = "Admin")]  
        public async Task<IActionResult> GrantAdmin(string userid)
        {
            var user = await _userManager.FindByIdAsync(userid);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new IdentityRole("Admin"));
            }
            await _userManager.AddToRoleAsync(user, "Admin");

            return Ok("Admin role granted.");
        }

        [HttpGet("revokeadmin/{userid}")]
        //[Authorize(Roles = "Admin")]
        public async Task<IActionResult> RevokeAdmin(string userid)
        {
            var user = await _userManager.FindByIdAsync(userid);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            await _userManager.RemoveFromRoleAsync(user, "Admin");
            return Ok("Admin role revoked.");
        }        [HttpGet("list")]
        //[Authorize] 
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync(); 
          
            var userList = new List<UserViewDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user); 
                userList.Add(new UserViewDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    IsAdmin = roles.Contains("Admin") 
                });
            }

            return Ok(userList);
        }
          [HttpGet("LearnedWords")]
        [Authorize]
        public async Task<IActionResult> GetLearnedWords()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var learnedWords = await _context.LearnedWords
                .Where(lw => lw.UserId == userId)
                .Include(lw => lw.DictionaryEntry)
                .OrderByDescending(lw => lw.LastClickedAt)
                .Select(lw => new LearnedWordDto
                {
                    Id = lw.Id,
                    DictionaryEntryId = lw.DictionaryEntryId,
                    EnglishPhrase = lw.DictionaryEntry.EnglishPhrase,
                    HungarianMeanings = lw.DictionaryEntry.HungarianMeanings,
                    LearnedAt = lw.LearnedAt,
                    LastClickedAt = lw.LastClickedAt
                })
                .ToListAsync();

            return Ok(learnedWords);
        }

        [HttpGet("FavoriteWords")]
        [Authorize]
        public async Task<IActionResult> GetFavoriteWords()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var favoriteWords = await _context.FavoriteWords
                .Where(fw => fw.UserId == userId)
                .Include(fw => fw.DictionaryEntry)
                .OrderByDescending(fw => fw.AddedAt)
                .Select(fw => new FavoriteWordDto
                {
                    Id = fw.Id,
                    DictionaryEntryId = fw.DictionaryEntryId,
                    EnglishPhrase = fw.DictionaryEntry.EnglishPhrase,
                    HungarianMeanings = fw.DictionaryEntry.HungarianMeanings,
                    AddedAt = fw.AddedAt
                })
                .ToListAsync();

            return Ok(favoriteWords);
        }
    }
}
