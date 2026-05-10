using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Order?> GetOpenByTableAsync(Guid tableId, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetOpenOrdersAsync(CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    Task UpdateAsync(Order order, CancellationToken ct = default);
}
