using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class SupplyCategoryRepository(ApplicationContext context) : ISupplyCategoryRepository
{
    public Task<SupplyCategory?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.SupplyCategories.FirstOrDefaultAsync(sc => sc.Id == id, ct);

    public async Task<IEnumerable<SupplyCategory>> GetAllAsync(CancellationToken ct = default) =>
        await context.SupplyCategories.OrderBy(sc => sc.SortOrder).ThenBy(sc => sc.Name).ToListAsync(ct);

    public async Task AddAsync(SupplyCategory supplyCategory, CancellationToken ct = default)
    {
        await context.SupplyCategories.AddAsync(supplyCategory, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(SupplyCategory supplyCategory, CancellationToken ct = default)
    {
        context.SupplyCategories.Update(supplyCategory);
        await context.SaveChangesAsync(ct);
    }
}
