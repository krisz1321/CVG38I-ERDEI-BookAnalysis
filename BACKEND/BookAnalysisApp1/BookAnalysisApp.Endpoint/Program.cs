using Microsoft.EntityFrameworkCore;
using BookAnalysisApp.Data;
using BookAnalysisApp.Entities;
using Swashbuckle.AspNetCore.SwaggerGen;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.Options;

namespace BookAnalysisApp.Endpoint
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // --- 1. KESTREL PORT BEÁLLÍTÁSA (VPS-hez) ---
            builder.WebHost.ConfigureKestrel(options =>
            {
                var port = builder.Configuration["settings:port"] ?? "7224";
                options.ListenAnyIP(int.Parse(port));
            });

            // --- 2. SZOLGÁLTATÁSOK REGISZTRÁLÁSA (Dependency Injection) ---
            builder.Services.AddControllers();

            // CORS beállítása
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
            });

            // Adatbázis kapcsolat (SQL Server)
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                  options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
            );

            builder.Services.AddScoped<DatabaseSeeder>();
            builder.Services.AddScoped<BookEditor>();

            // Identity beállítások
            builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            // JWT Authentication beállítások
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
                    ValidAudience = builder.Configuration["JWT:ValidAudience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
                };
            });

            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SchemaFilter<RemoveWordFrequencySchemaFilter>();
            });

            // --- 3. ALKALMAZÁS FELÉPÍTÉSE (Build) ---
            // Fontos: Az "app" változó csak itt jön létre!
            var app = builder.Build();

            // --- 4. ADATBÁZIS INICIALIZÁLÁS (Csak a Build után!) ---
            using (var scope = app.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var dbContext = services.GetRequiredService<ApplicationDbContext>();

                    // EZ A SOR JAVÍTJA A HIBÁT: Létrehozza a táblákat (Books, Users, stb.), ha még nincsenek.
                    dbContext.Database.EnsureCreated();

                    var seeder = services.GetRequiredService<DatabaseSeeder>();
                    seeder.SeedDatabase();
                }
                catch (Exception ex)
                {
                    // Ha hiba van az adatbázis létrehozásakor, kiírjuk a konzolra
                    Console.WriteLine("Hiba történt az adatbázis inicializálása közben: " + ex.Message);
                }
            }

            // --- 5. MIDDLEWARE PIPELINE ---
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseHttpsRedirection(); // VPS-en, ha nincs HTTPS, ez okozhat warningot, de maradhat.
            app.UseAuthorization();

            app.MapControllers();

            // --- 6. INDÍTÁS ---
            app.Run();
        }
    }

    // Swagger szűrő osztály
    public class RemoveWordFrequencySchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(Book))
            {
                schema.Properties.Remove("wordFrequency");
            }
        }
    }
}