using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class TableRepository(ApplicationContext context) : ITableRepository
{
    public Task<Table?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Tables.FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<IEnumerable<Table>> GetAllActiveAsync(CancellationToken ct = default) =>
        await context.Tables.Where(t => t.IsActive).ToListAsync(ct);

    public async Task AddAsync(Table table, CancellationToken ct = default) =>
        await context.Tables.AddAsync(table, ct);

    public Task UpdateAsync(Table table, CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }
}
