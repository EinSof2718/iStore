using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exam_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotosReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UrlImage",
                table: "Reviews");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UrlImage",
                table: "Reviews",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
