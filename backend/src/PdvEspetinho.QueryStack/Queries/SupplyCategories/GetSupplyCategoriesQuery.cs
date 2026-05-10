using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.SupplyCategories;

public class GetSupplyCategoriesQuery(QueryDb queryDb)
{
    public async Task<List<SupplyCategoryDto>> ExecuteAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            "SELECT id, name, slug, icon, sort_order FROM supply_categories ORDER BY sort_order, name");

        return rows.Select(r => new SupplyCategoryDto(
            (Guid)r.id, (string)r.name, (string)r.slug,
            (string)r.icon, (int)r.sort_order)).ToList();
    }
}
