using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LipaCityARTA.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminUsers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Complaints",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Office = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DateSubmitted = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Complaints", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SurveyResponses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Office = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Sex = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClientType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CC1 = table.Column<int>(type: "int", nullable: false),
                    CC2 = table.Column<int>(type: "int", nullable: false),
                    CC3 = table.Column<int>(type: "int", nullable: false),
                    SQD0 = table.Column<int>(type: "int", nullable: false),
                    SQD1 = table.Column<int>(type: "int", nullable: false),
                    SQD2 = table.Column<int>(type: "int", nullable: false),
                    SQD3 = table.Column<int>(type: "int", nullable: false),
                    SQD4 = table.Column<int>(type: "int", nullable: false),
                    SQD5 = table.Column<int>(type: "int", nullable: false),
                    SQD6 = table.Column<int>(type: "int", nullable: false),
                    SQD7 = table.Column<int>(type: "int", nullable: false),
                    SQD8 = table.Column<int>(type: "int", nullable: false),
                    Suggestions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DateSubmitted = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyResponses", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "AdminUsers",
                columns: new[] { "Id", "Email", "Password", "Username" },
                values: new object[] { 1, "admin@lipacityarta.local", "admin123", "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminUsers");

            migrationBuilder.DropTable(
                name: "Complaints");

            migrationBuilder.DropTable(
                name: "SurveyResponses");
        }
    }
}
