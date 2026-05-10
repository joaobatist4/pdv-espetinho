using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Categories;

public class GetCategoriesQuery(QueryDb queryDb)
{
    public async Task<List<CategoryDto>> ExecuteAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            "SELECT id, name, slug, icon, sort_order FROM categories ORDER BY sort_order, name");

        return rows.Select(r => new CategoryDto(
            (Guid)r.id, (string)r.name, (string)r.slug,
            (string)r.icon, (int)r.sort_order)).ToList();
    }
}
