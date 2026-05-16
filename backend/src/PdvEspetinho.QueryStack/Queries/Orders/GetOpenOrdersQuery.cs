using Dapper;
using Npgsql;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Orders;

public class GetOpenOrdersQuery(QueryDb queryDb)
{
    public async Task<List<OrderDetailDto>> ExecuteAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var orderRows = await conn.QueryAsync(
            @"SELECT o.id, o.table_id, t.label as table_label,
                     u.name as attendant_name, o.status, o.opened_at
              FROM orders o
              JOIN tables t ON t.id = o.table_id
              JOIN users u ON u.id = o.attendant_id
              WHERE o.status = 'Open'
              ORDER BY o.opened_at");

        var result = new List<OrderDetailDto>();
        foreach (var row in orderRows)
        {
            var items = await GetItemsAsync(conn, (Guid)row.id);
            result.Add(new OrderDetailDto(
                (Guid)row.id, (Guid)row.table_id, (string)row.table_label,
                (string)row.attendant_name, (string)row.status,
                (DateTime)row.opened_at, null, items.Sum(i => i.Total), items, []));
        }
        return result;
    }

    public async Task<OrderDetailDto?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var row = await conn.QuerySingleOrDefaultAsync(
            @"SELECT o.id, o.table_id, t.label as table_label,
                     u.name as attendant_name, o.status, o.opened_at, o.closed_at
              FROM orders o
              JOIN tables t ON t.id = o.table_id
              JOIN users u ON u.id = o.attendant_id
              WHERE o.id = @id",
            new { id = orderId });

        if (row is null) return null;
        var items = await GetItemsAsync(conn, orderId);
        var payments = await GetPaymentsAsync(conn, orderId);
        return new OrderDetailDto(
            (Guid)row.id, (Guid)row.table_id, (string)row.table_label,
            (string)row.attendant_name, (string)row.status,
            (DateTime)row.opened_at,
            row.closed_at is null ? null : (DateTime?)row.closed_at,
            items.Sum(i => i.Total), items, payments);
    }

    public async Task<KitchenTicketDto?> GetKitchenTicketAsync(Guid orderId, CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var row = await conn.QuerySingleOrDefaultAsync(
            "SELECT o.id, t.label as table_label, o.opened_at FROM orders o JOIN tables t ON t.id = o.table_id WHERE o.id = @id",
            new { id = orderId });

        if (row is null) return null;

        var itemRows = await conn.QueryAsync(
            "SELECT product_name, quantity FROM order_items WHERE order_id = @id AND goes_to_kitchen = true ORDER BY created_at",
            new { id = orderId });

        var items = itemRows.Select(i => new KitchenItemDto((string)i.product_name, (int)i.quantity)).ToList();
        return new KitchenTicketDto((Guid)row.id, (string)row.table_label, (DateTime)row.opened_at, items);
    }

    private static async Task<List<OrderPaymentDto>> GetPaymentsAsync(NpgsqlConnection conn, Guid orderId)
    {
        var rows = await conn.QueryAsync(
            @"SELECT sp.method, sp.amount
              FROM sale_payments sp
              JOIN sales s ON s.id = sp.sale_id
              WHERE s.order_id = @orderId
              ORDER BY sp.amount DESC",
            new { orderId });

        return rows.Select(r => new OrderPaymentDto((string)r.method, (decimal)r.amount)).ToList();
    }

    private static async Task<List<OrderItemDetailDto>> GetItemsAsync(NpgsqlConnection conn, Guid orderId)
    {
        var rows = await conn.QueryAsync(
            "SELECT id, product_id, product_name, unit_price, quantity, goes_to_kitchen, status FROM order_items WHERE order_id = @id ORDER BY created_at",
            new { id = orderId });

        return rows.Select(r => new OrderItemDetailDto(
            (Guid)r.id, (Guid)r.product_id, (string)r.product_name,
            (decimal)r.unit_price, (int)r.quantity, (bool)r.goes_to_kitchen,
            (string)r.status, (decimal)r.unit_price * (int)r.quantity)).ToList();
    }
}
