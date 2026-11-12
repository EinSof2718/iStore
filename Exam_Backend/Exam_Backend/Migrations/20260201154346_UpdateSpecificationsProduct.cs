using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exam_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpecificationsProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CountSimCards",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Peculiarities",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Processor",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Weight",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountSimCards",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Peculiarities",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Processor",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Size",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Weight",
                table: "SpecificationsProducts");
        }
    }
}
