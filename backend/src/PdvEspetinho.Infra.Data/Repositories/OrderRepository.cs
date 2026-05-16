using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class OrderRepository(ApplicationContext context) : IOrderRepository
{
    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id, ct);

    public Task<Order?> GetOpenByTableAsync(Guid tableId, CancellationToken ct = default) =>
        context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == OrderStatus.Open, ct);

    public async Task<IEnumerable<Order>> GetOpenOrdersAsync(CancellationToken ct = default) =>
        await context.Orders
            .Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.Open)
            .OrderBy(o => o.OpenedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Order order, CancellationToken ct = default) =>
        await context.Orders.AddAsync(order, ct);

    public Task UpdateAsync(Order order, CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }
}
