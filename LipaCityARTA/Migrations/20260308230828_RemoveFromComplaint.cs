using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LipaCityARTA.Migrations
{
    /// <inheritdoc />
    public partial class RemoveFromComplaint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Severity",
                table: "Complaints");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Severity",
                table: "Complaints",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
