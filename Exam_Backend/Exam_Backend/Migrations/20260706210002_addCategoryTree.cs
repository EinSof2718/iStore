using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exam_Backend.Migrations
{
    /// <inheritdoc />
    public partial class addCategoryTree : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentCategoryId",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ParentCategories",
                columns: table => new
                {
                    ParentCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParentCategories", x => x.ParentCategoryId);
                });

            // ─── ВСТАВИТЬ ЭТОТ БЛОК ───
            // Сначала заполняем таблицу и обновляем Categories
            migrationBuilder.Sql(@"
        SET IDENTITY_INSERT ParentCategories ON;
        INSERT INTO ParentCategories (ParentCategoryId, Name) VALUES (1, N'Общая категория');
        SET IDENTITY_INSERT ParentCategories OFF;

        UPDATE Categories SET ParentCategoryId = 1 WHERE ParentCategoryId = 0;
    ");
            // ─── КОНЕЦ ВСТАВКИ ───

            migrationBuilder.CreateIndex(
                name: "IX_Categories_ParentCategoryId",
                table: "Categories",
                column: "ParentCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_ParentCategories_ParentCategoryId",
                table: "Categories",
                column: "ParentCategoryId",
                principalTable: "ParentCategories",
                principalColumn: "ParentCategoryId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
