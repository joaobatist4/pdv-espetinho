using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PdvEspetinho.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderNavigationConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_orders_attendant_id",
                table: "orders",
                column: "attendant_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_employee_id",
                table: "orders",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_table_id",
                table: "orders",
                column: "table_id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_employees_employee_id",
                table: "orders",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_tables_table_id",
                table: "orders",
                column: "table_id",
                principalTable: "tables",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_orders_users_attendant_id",
                table: "orders",
                column: "attendant_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_employees_employee_id",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_tables_table_id",
                table: "orders");

            migrationBuilder.DropForeignKey(
                name: "FK_orders_users_attendant_id",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_attendant_id",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_employee_id",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_table_id",
                table: "orders");
        }
    }
}
