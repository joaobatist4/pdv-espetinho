using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Orders;

public class GetOrdersReportQuery(QueryDb queryDb)
{
    public async Task<PagedResult<OrderReportItemDto>> ExecuteAsync(
        string? status, DateOnly? dateFrom, DateOnly? dateTo,
        string? search, int page, int pageSize,
        CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var searchPattern = string.IsNullOrWhiteSpace(search) ? null : $"%{search.Trim()}%";
        var offset = (page - 1) * pageSize;

        const string whereClause = """
            WHERE
              (@Status::text IS NULL OR o.status = @Status::text)
              AND (@DateFrom::timestamp IS NULL OR o.opened_at >= @DateFrom::timestamp)
              AND (@DateTo::timestamp IS NULL OR o.opened_at < @DateTo::timestamp)
              AND (
                @SearchPattern::text IS NULL OR
                t.label ILIKE @SearchPattern::text OR
                u.name ILIKE @SearchPattern::text OR
                EXISTS (
                  SELECT 1 FROM order_items oi
                  WHERE oi.order_id = o.id AND oi.product_name ILIKE @SearchPattern::text
                )
              )
            """;

        var countSql = $"""
            SELECT COUNT(*) FROM orders o
            JOIN tables t ON t.id = o.table_id
            JOIN users u ON u.id = o.attendant_id
            {whereClause}
            """;

        var dataSql = $"""
            SELECT
              o.id,
              t.label AS table_label,
              u.name AS attendant_name,
              o.status,
              o.opened_at,
              o.closed_at,
              COALESCE((SELECT SUM(unit_price * quantity) FROM order_items WHERE order_id = o.id), 0) AS total,
              (SELECT COUNT(*)::int FROM order_items WHERE order_id = o.id) AS item_count,
              COALESCE(
                (SELECT STRING_AGG(quantity::text || '× ' || product_name, ', ' ORDER BY created_at)
                 FROM order_items WHERE order_id = o.id),
              '') AS items_summary
            FROM orders o
            JOIN tables t ON t.id = o.table_id
            JOIN users u ON u.id = o.attendant_id
            {whereClause}
            ORDER BY o.opened_at DESC
            LIMIT @PageSize OFFSET @Offset
            """;

        var parameters = new
        {
            Status = status,
            DateFrom = dateFrom.HasValue ? (DateTime?)dateFrom.Value.ToDateTime(TimeOnly.MinValue) : null,
            DateTo = dateTo.HasValue ? (DateTime?)dateTo.Value.AddDays(1).ToDateTime(TimeOnly.MinValue) : null,
            SearchPattern = searchPattern,
            PageSize = pageSize,
            Offset = offset
        };

        var total = await conn.ExecuteScalarAsync<int>(countSql, parameters);

        var rows = await conn.QueryAsync(dataSql, parameters);

        var items = rows.Select(r => new OrderReportItemDto(
            (Guid)r.id,
            (string)r.table_label,
            (string)r.attendant_name,
            (string)r.status,
            (DateTime)r.opened_at,
            r.closed_at is null ? null : (DateTime?)r.closed_at,
            (decimal)r.total,
            (int)r.item_count,
            (string)r.items_summary
        )).ToList();

        return new PagedResult<OrderReportItemDto>(items, total, page, pageSize);
    }
}
