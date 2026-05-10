using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class StockItemRepository(ApplicationContext context) : IStockItemRepository
{
    public Task<StockItem?> GetByProductIdAsync(Guid productId, CancellationToken ct = default) =>
        context.StockItems.FirstOrDefaultAsync(s => s.ProductId == productId, ct);

    public async Task<IEnumerable<StockItem>> GetAllAsync(CancellationToken ct = default) =>
        await context.StockItems.ToListAsync(ct);

    public async Task AddAsync(StockItem item, CancellationToken ct = default)
    {
        await context.StockItems.AddAsync(item, ct);
        await context.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(StockItem item, CancellationToken ct = default)
    {
        context.StockItems.Update(item);
        await context.SaveChangesAsync(ct);
    }
}
