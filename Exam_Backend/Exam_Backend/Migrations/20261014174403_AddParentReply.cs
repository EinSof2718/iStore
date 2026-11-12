using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exam_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddParentReply : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentReplyId",
                table: "ReviewReplys",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentReplyId",
                table: "ReviewReplys");
        }
    }
}
