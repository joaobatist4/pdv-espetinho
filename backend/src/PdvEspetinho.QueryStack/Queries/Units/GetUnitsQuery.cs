using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Units;

public class GetUnitsQuery(QueryDb queryDb)
{
    public async Task<List<UnitDto>> ExecuteAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            "SELECT id, name, label, sort_order FROM units ORDER BY sort_order, name");

        return rows.Select(r => new UnitDto(
            (Guid)r.id, (string)r.name, (string)r.label, (int)r.sort_order)).ToList();
    }
}
