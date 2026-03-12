using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LipaCityARTA.Migrations
{
    /// <inheritdoc />
    public partial class AddTrackingIdToComplaint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TrackingId",
                table: "Complaints",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
        UPDATE Complaints
        SET TrackingId = 'ARTA-' + RIGHT('00000000' + CAST(Id AS VARCHAR(8)), 8)
        WHERE TrackingId = '' OR TrackingId IS NULL;
    ");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_TrackingId",
                table: "Complaints",
                column: "TrackingId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Complaints_TrackingId",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "TrackingId",
                table: "Complaints");
        }
    }
}
