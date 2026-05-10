using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Users;

public class GetUsersQuery(QueryDb queryDb)
{
    public async Task<List<UserDto>> ExecuteAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            "SELECT id, name, email, role, permissions, is_active, created_at FROM users ORDER BY name");

        return rows.Select(r => new UserDto(
            (Guid)r.id, (string)r.name, (string)r.email, (string)r.role,
            string.IsNullOrEmpty((string?)r.permissions)
                ? [] : ((string)r.permissions).Split(',').ToList(),
            (bool)r.is_active, (DateTime)r.created_at)).ToList();
    }
}
