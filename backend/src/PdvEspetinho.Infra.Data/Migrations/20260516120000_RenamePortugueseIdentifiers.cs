using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PdvEspetinho.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class RenamePortugueseIdentifiers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ── StockMovement: rename columns ────────────────────────────────
            migrationBuilder.RenameColumn(
                name: "quantidade_antes",
                table: "stock_movements",
                newName: "quantity_before");

            migrationBuilder.RenameColumn(
                name: "quantidade_depois",
                table: "stock_movements",
                newName: "quantity_after");

            // ── stock_movements.type: MovementType ───────────────────────────
            migrationBuilder.Sql("UPDATE stock_movements SET type = 'Entry'      WHERE type = 'Entrada'");
            migrationBuilder.Sql("UPDATE stock_movements SET type = 'Exit'       WHERE type = 'Saida'");
            migrationBuilder.Sql("UPDATE stock_movements SET type = 'Adjustment' WHERE type = 'Ajuste'");

            // ── orders.status: OrderStatus ───────────────────────────────────
            migrationBuilder.Sql("UPDATE orders SET status = 'Open'      WHERE status = 'Aberto'");
            migrationBuilder.Sql("UPDATE orders SET status = 'Closed'    WHERE status = 'Fechado'");
            migrationBuilder.Sql("UPDATE orders SET status = 'Cancelled' WHERE status = 'Cancelado'");

            // ── order_items.status: OrderItemStatus ──────────────────────────
            migrationBuilder.Sql("UPDATE order_items SET status = 'Pending'   WHERE status = 'Aguardando'");
            migrationBuilder.Sql("UPDATE order_items SET status = 'Preparing' WHERE status = 'Preparando'");
            migrationBuilder.Sql("UPDATE order_items SET status = 'Ready'     WHERE status = 'Pronto'");
            migrationBuilder.Sql("UPDATE order_items SET status = 'Delivered' WHERE status = 'Entregue'");

            // ── tables.type: TableType ───────────────────────────────────────
            migrationBuilder.Sql("UPDATE tables SET type = 'Table'   WHERE type = 'Mesa'");
            migrationBuilder.Sql("UPDATE tables SET type = 'Counter' WHERE type = 'Balcao'");

            // ── tables.status: TableStatus ───────────────────────────────────
            migrationBuilder.Sql("UPDATE tables SET status = 'Available'     WHERE status = 'Livre'");
            migrationBuilder.Sql("UPDATE tables SET status = 'Occupied'      WHERE status = 'Ocupada'");
            migrationBuilder.Sql("UPDATE tables SET status = 'BillRequested' WHERE status = 'ContaPedida'");

            // ── sale_payments.method: PaymentMethod ──────────────────────────
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Cash'  WHERE method = 'Dinheiro'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Debit' WHERE method = 'Debito'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Credit' WHERE method = 'Credito'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'OnTab' WHERE method = 'Fiado'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Mixed' WHERE method = 'Misto'");

            // ── users.role: Role ─────────────────────────────────────────────
            migrationBuilder.Sql("UPDATE users SET role = 'Manager' WHERE role = 'Gerente'");
            migrationBuilder.Sql("UPDATE users SET role = 'Waiter'  WHERE role = 'Garconete'");
            migrationBuilder.Sql("UPDATE users SET role = 'Kitchen' WHERE role = 'Cozinha'");

            // ── users.permissions: Permission (comma-separated) ───────────────
            // Order matters: replace compound 'EstoqueBebidas' before 'Estoque'
            migrationBuilder.Sql(@"
                UPDATE users SET permissions =
                    replace(
                        replace(
                            replace(
                                replace(
                                    replace(permissions, 'EstoqueBebidas', 'BeverageStock'),
                                'Estoque', 'Stock'),
                            'Pedidos', 'Orders'),
                        'Usuarios', 'Users'),
                    'Cadastro', 'Registration')
                WHERE permissions != ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // ── StockMovement: revert column renames ─────────────────────────
            migrationBuilder.RenameColumn(
                name: "quantity_before",
                table: "stock_movements",
                newName: "quantidade_antes");

            migrationBuilder.RenameColumn(
                name: "quantity_after",
                table: "stock_movements",
                newName: "quantidade_depois");

            // ── stock_movements.type ─────────────────────────────────────────
            migrationBuilder.Sql("UPDATE stock_movements SET type = 'Entrada' WHERE type = 'Entry'");
            migrationBuilder.Sql("UPDATE stock_movements SET type = 'Saida'   WHERE type = 'Exit'");
            migrationBuilder.Sql("UPDATE stock_movements SET type = 'Ajuste'  WHERE type = 'Adjustment'");

            // ── orders.status ────────────────────────────────────────────────
            migrationBuilder.Sql("UPDATE orders SET status = 'Aberto'    WHERE status = 'Open'");
            migrationBuilder.Sql("UPDATE orders SET status = 'Fechado'   WHERE status = 'Closed'");
            migrationBuilder.Sql("UPDATE orders SET status = 'Cancelado' WHERE status = 'Cancelled'");

            // ── order_items.status ───────────────────────────────────────────
            migrationBuilder.Sql("UPDATE order_items SET status = 'Aguardando' WHERE status = 'Pending'");
            migrationBuilder.Sql("UPDATE order_items SET status = 'Preparando' WHERE status = 'Preparing'");
            migrationBuilder.Sql("UPDATE order_items SET status = 'Pronto'     WHERE status = 'Ready'");
            migrationBuilder.Sql("UPDATE order_items SET status = 'Entregue'   WHERE status = 'Delivered'");

            // ── tables.type ──────────────────────────────────────────────────
            migrationBuilder.Sql("UPDATE tables SET type = 'Mesa'   WHERE type = 'Table'");
            migrationBuilder.Sql("UPDATE tables SET type = 'Balcao' WHERE type = 'Counter'");

            // ── tables.status ────────────────────────────────────────────────
            migrationBuilder.Sql("UPDATE tables SET status = 'Livre'       WHERE status = 'Available'");
            migrationBuilder.Sql("UPDATE tables SET status = 'Ocupada'     WHERE status = 'Occupied'");
            migrationBuilder.Sql("UPDATE tables SET status = 'ContaPedida' WHERE status = 'BillRequested'");

            // ── sale_payments.method ─────────────────────────────────────────
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Dinheiro' WHERE method = 'Cash'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Debito'   WHERE method = 'Debit'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Credito'  WHERE method = 'Credit'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Fiado'    WHERE method = 'OnTab'");
            migrationBuilder.Sql("UPDATE sale_payments SET method = 'Misto'    WHERE method = 'Mixed'");

            // ── users.role ───────────────────────────────────────────────────
            migrationBuilder.Sql("UPDATE users SET role = 'Gerente'   WHERE role = 'Manager'");
            migrationBuilder.Sql("UPDATE users SET role = 'Garconete' WHERE role = 'Waiter'");
            migrationBuilder.Sql("UPDATE users SET role = 'Cozinha'   WHERE role = 'Kitchen'");

            // ── users.permissions ────────────────────────────────────────────
            migrationBuilder.Sql(@"
                UPDATE users SET permissions =
                    replace(
                        replace(
                            replace(
                                replace(
                                    replace(permissions, 'BeverageStock', 'EstoqueBebidas'),
                                'Stock', 'Estoque'),
                            'Orders', 'Pedidos'),
                        'Users', 'Usuarios'),
                    'Registration', 'Cadastro')
                WHERE permissions != ''");
        }
    }
}
