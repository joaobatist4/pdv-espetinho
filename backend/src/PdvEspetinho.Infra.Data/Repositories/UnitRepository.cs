using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class UnitRepository(ApplicationContext context) : IUnitRepository
{
    public Task<Unit?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Units.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task<IEnumerable<Unit>> GetAllAsync(CancellationToken ct = default) =>
        await context.Units.OrderBy(u => u.SortOrder).ThenBy(u => u.Name).ToListAsync(ct);

    public async Task AddAsync(Unit unit, CancellationToken ct = default)
    {
        await context.Units.AddAsync(unit, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Unit unit, CancellationToken ct = default)
    {
        context.Units.Update(unit);
        await context.SaveChangesAsync(ct);
    }
}
