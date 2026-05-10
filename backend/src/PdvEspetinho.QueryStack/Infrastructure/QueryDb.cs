using Npgsql;

namespace PdvEspetinho.QueryStack.Infrastructure;

public class QueryDb(string connectionString)
{
    public NpgsqlConnection CreateConnection() => new(connectionString);
}
