using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exam_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSpecificationsProduct_2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Batery",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Cameras",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "CountSimCards",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "DisplaySize",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "MemoryCapacity",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "OS",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Peculiarities",
                table: "SpecificationsProducts");

            migrationBuilder.DropColumn(
                name: "Processor",
                table: "SpecificationsProducts");

            migrationBuilder.RenameColumn(
                name: "Weight",
                table: "SpecificationsProducts",
                newName: "SpecificationsValue");

            migrationBuilder.RenameColumn(
                name: "Size",
                table: "SpecificationsProducts",
                newName: "SpecificationsKey");

            migrationBuilder.RenameColumn(
                name: "MemoryRAMCapacity",
                table: "SpecificationsProducts",
                newName: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_SpecificationsProducts_ProductId",
                table: "SpecificationsProducts",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_SpecificationsProducts_Products_ProductId",
                table: "SpecificationsProducts",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SpecificationsProducts_Products_ProductId",
                table: "SpecificationsProducts");

            migrationBuilder.DropIndex(
                name: "IX_SpecificationsProducts_ProductId",
                table: "SpecificationsProducts");

            migrationBuilder.RenameColumn(
                name: "SpecificationsValue",
                table: "SpecificationsProducts",
                newName: "Weight");

            migrationBuilder.RenameColumn(
                name: "SpecificationsKey",
                table: "SpecificationsProducts",
                newName: "Size");

            migrationBuilder.RenameColumn(
                name: "SortOrder",
                table: "SpecificationsProducts",
                newName: "MemoryRAMCapacity");

            migrationBuilder.AddColumn<int>(
                name: "Batery",
                table: "SpecificationsProducts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Cameras",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CountSimCards",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DisplaySize",
                table: "SpecificationsProducts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MemoryCapacity",
                table: "SpecificationsProducts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "OS",
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
        }
    }
}
