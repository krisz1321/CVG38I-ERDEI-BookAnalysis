using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookAnalysisApp.Data.Migrations
{
    public partial class UserWordsFeature : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // AppUser LastLoginAt mező hozzáadása
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastLoginAt",
                table: "AspNetUsers",
                nullable: true);
            
            // UserLoginRecord tábla létrehozása
            migrationBuilder.CreateTable(
                name: "LoginHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<string>(nullable: false),
                    LoginAt = table.Column<DateTimeOffset>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoginHistory_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });
            
            // LearnedWords tábla létrehozása
            migrationBuilder.CreateTable(
                name: "LearnedWords",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<string>(nullable: false),
                    DictionaryEntryId = table.Column<Guid>(nullable: false),
                    LearnedAt = table.Column<DateTimeOffset>(nullable: false),
                    LastClickedAt = table.Column<DateTimeOffset>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LearnedWords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LearnedWords_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LearnedWords_EnglishHungarianPhrases_DictionaryEntryId",
                        column: x => x.DictionaryEntryId,
                        principalTable: "EnglishHungarianPhrases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });
            
            // FavoriteWords tábla létrehozása
            migrationBuilder.CreateTable(
                name: "FavoriteWords",
                columns: table => new
                {
                    Id = table.Column<Guid>(nullable: false),
                    UserId = table.Column<string>(nullable: false),
                    DictionaryEntryId = table.Column<Guid>(nullable: false),
                    AddedAt = table.Column<DateTimeOffset>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteWords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FavoriteWords_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FavoriteWords_EnglishHungarianPhrases_DictionaryEntryId",
                        column: x => x.DictionaryEntryId,
                        principalTable: "EnglishHungarianPhrases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Indexek létrehozása
            migrationBuilder.CreateIndex(
                name: "IX_LoginHistory_UserId",
                table: "LoginHistory",
                column: "UserId");
                
            migrationBuilder.CreateIndex(
                name: "IX_LearnedWords_UserId",
                table: "LearnedWords",
                column: "UserId");
                
            migrationBuilder.CreateIndex(
                name: "IX_LearnedWords_DictionaryEntryId",
                table: "LearnedWords",
                column: "DictionaryEntryId");
                
            migrationBuilder.CreateIndex(
                name: "IX_FavoriteWords_UserId",
                table: "FavoriteWords",
                column: "UserId");
                
            migrationBuilder.CreateIndex(
                name: "IX_FavoriteWords_DictionaryEntryId",
                table: "FavoriteWords",
                column: "DictionaryEntryId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Táblák törlése fordított sorrendben
            migrationBuilder.DropTable(
                name: "FavoriteWords");
                
            migrationBuilder.DropTable(
                name: "LearnedWords");
                
            migrationBuilder.DropTable(
                name: "LoginHistory");
            
            // LastLoginAt mező eltávolítása
            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "AspNetUsers");
        }
    }
}
