using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookAnalysisApp.Data.Migrations
{
    public partial class AddBookPhraseIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create index on BookId for faster querying by book
            migrationBuilder.CreateIndex(
                name: "IX_BookPhrases_BookId_Frequency",
                table: "BookPhrases",
                columns: new[] { "BookId", "Frequency" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookPhrases_BookId_Frequency",
                table: "BookPhrases");
        }
    }
}
