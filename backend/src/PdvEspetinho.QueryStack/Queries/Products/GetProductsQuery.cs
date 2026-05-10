using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Products;

public class GetProductsQuery(QueryDb queryDb)
{
    public async Task<List<ProductDto>> ExecuteAsync(Guid? categoryId = null, CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var sql = @"SELECT p.id, p.name, p.category_id, c.name as category_name, c.slug as category_slug,
                           p.subcategory, p.price, p.unit, p.goes_to_kitchen, p.has_stock, p.is_active
                    FROM products p
                    JOIN categories c ON c.id = p.category_id
                    WHERE p.is_active = true";

        if (categoryId.HasValue)
            sql += " AND p.category_id = @catId";

        sql += " ORDER BY c.sort_order, p.subcategory, p.name";

        var rows = await conn.QueryAsync(sql, categoryId.HasValue ? new { catId = categoryId.Value } : null);

        return rows.Select(r => new ProductDto(
            (Guid)r.id, (string)r.name, (Guid)r.category_id,
            (string)r.category_name, (string)r.category_slug,
            (string)(r.subcategory ?? ""), (decimal)r.price, (string)r.unit,
            (bool)r.goes_to_kitchen, (bool)r.has_stock, (bool)r.is_active)).ToList();
    }
}
