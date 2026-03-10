using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LipaCityARTA.Migrations
{
    /// <inheritdoc />
    public partial class AddClientTypeToComplaint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClientType",
                table: "Complaints",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClientType",
                table: "Complaints");
        }
    }
}
