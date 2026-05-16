using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Tables;

public class GetTablesWithStatusQuery(QueryDb queryDb)
{
    public async Task<List<TableStatusDto>> ExecuteAsync(bool includeInactive = false, CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var where = includeInactive ? "" : "WHERE t.is_active = true";

        var rows = await conn.QueryAsync(
            $@"SELECT t.id, t.label, t.type, t.status, t.is_active,
                     o.id as current_order_id,
                     COALESCE(SUM(oi.unit_price * oi.quantity), 0) as current_total,
                     COUNT(oi.id)::int as item_count,
                     o.opened_at
              FROM tables t
              LEFT JOIN orders o ON o.table_id = t.id AND o.status = 'Open'
              LEFT JOIN order_items oi ON oi.order_id = o.id
              {where}
              GROUP BY t.id, t.label, t.type, t.status, t.is_active, o.id, o.opened_at
              ORDER BY t.label");

        return rows.Select(r => new TableStatusDto(
            (Guid)r.id, (string)r.label, (string)r.type, (string)r.status,
            (bool)r.is_active,
            r.current_order_id is null ? null : (Guid?)r.current_order_id,
            (decimal)r.current_total, (int)r.item_count,
            r.opened_at is null ? null : (DateTime?)r.opened_at)).ToList();
    }
}
