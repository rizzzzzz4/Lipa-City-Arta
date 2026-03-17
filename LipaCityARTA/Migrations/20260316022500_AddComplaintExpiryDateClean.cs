using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LipaCityARTA.Migrations
{
    /// <inheritdoc />
    public partial class AddComplaintExpiryDateClean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignedToAdminUserId",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "Complaints");

            migrationBuilder.DropColumn(
                name: "AssignedToAdminUserId",
                table: "AdminUsers");

            migrationBuilder.DropColumn(
                name: "ResolvedAt",
                table: "AdminUsers");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Complaints",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Complaints");

            migrationBuilder.AddColumn<int>(
                name: "AssignedToAdminUserId",
                table: "Complaints",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "Complaints",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AssignedToAdminUserId",
                table: "AdminUsers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAt",
                table: "AdminUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AdminUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "AssignedToAdminUserId", "ResolvedAt" },
                values: new object[] { null, null });
        }
    }
}
