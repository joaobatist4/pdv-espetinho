using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Repositories;

public interface IStockItemRepository
{
    Task<StockItem?> GetByProductIdAsync(Guid productId, CancellationToken ct = default);
    Task<IEnumerable<StockItem>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(StockItem item, CancellationToken ct = default);
    Task UpdateAsync(StockItem item, CancellationToken ct = default);
}
