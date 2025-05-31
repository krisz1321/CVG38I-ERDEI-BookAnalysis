using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookAnalysisApp.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLastLoginAtToAppUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastLoginAt",
                table: "AspNetUsers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "FavoriteWords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DictionaryEntryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "LearnedWords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DictionaryEntryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LearnedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastClickedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "LoginHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "IX_BookPhrases_BookId_Frequency",
                table: "BookPhrases",
                columns: new[] { "BookId", "Frequency" });

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteWords_DictionaryEntryId",
                table: "FavoriteWords",
                column: "DictionaryEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteWords_UserId",
                table: "FavoriteWords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LearnedWords_DictionaryEntryId",
                table: "LearnedWords",
                column: "DictionaryEntryId");

            migrationBuilder.CreateIndex(
                name: "IX_LearnedWords_UserId",
                table: "LearnedWords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_LoginHistory_UserId",
                table: "LoginHistory",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FavoriteWords");

            migrationBuilder.DropTable(
                name: "LearnedWords");

            migrationBuilder.DropTable(
                name: "LoginHistory");

            migrationBuilder.DropIndex(
                name: "IX_BookPhrases_BookId_Frequency",
                table: "BookPhrases");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "AspNetUsers");
        }
    }
}
