using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PdvEspetinho.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderItemNote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "order_items",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "note",
                table: "order_items");
        }
    }
}
