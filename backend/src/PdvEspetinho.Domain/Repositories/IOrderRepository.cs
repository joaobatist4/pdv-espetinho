using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Repositories;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, OrderIncludes includes = OrderIncludes.None, CancellationToken ct = default);
    Task<Order?> GetOpenByTableAsync(Guid tableId, CancellationToken ct = default);
    Task<IEnumerable<Order>> GetOpenOrdersAsync(CancellationToken ct = default);
    Task AddAsync(Order order, CancellationToken ct = default);
    Task UpdateAsync(Order order, CancellationToken ct = default);
}

[Flags]
public enum OrderIncludes
{
    None = 0,
    Items = 1,
    Table = 2,
    Attendant = 4,
    Employee = 8
}
