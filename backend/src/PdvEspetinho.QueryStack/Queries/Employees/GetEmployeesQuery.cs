using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Employees;

public class GetEmployeesQuery(QueryDb queryDb)
{
    public async Task<List<EmployeeDto>> ExecuteAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        const string sql = @"
            SELECT id, name, matricula, is_active
            FROM employees
            ORDER BY name";

        var rows = await conn.QueryAsync(sql);

        return rows.Select(r => new EmployeeDto(
            (Guid)r.id, (string)r.name, (string)r.matricula, (bool)r.is_active)).ToList();
    }
}
