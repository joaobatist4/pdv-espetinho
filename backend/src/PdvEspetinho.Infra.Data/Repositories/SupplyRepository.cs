using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class SupplyRepository(ApplicationContext context) : ISupplyRepository
{
    public Task<Supply?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Supplies.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<IEnumerable<Supply>> GetAllActiveAsync(CancellationToken ct = default) =>
        await context.Supplies.Where(s => s.IsActive).OrderBy(s => s.Name).ToListAsync(ct);

    public async Task AddAsync(Supply supply, CancellationToken ct = default) =>
        await context.Supplies.AddAsync(supply, ct);

    public Task UpdateAsync(Supply supply, CancellationToken ct = default)
    {
        context.Supplies.Update(supply);
        return Task.CompletedTask;
    }
}
