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
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == OrderStatus.Aberto, ct);

    public async Task<IEnumerable<Order>> GetOpenOrdersAsync(CancellationToken ct = default) =>
        await context.Orders
            .Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.Aberto)
            .OrderBy(o => o.OpenedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Order order, CancellationToken ct = default) =>
        await context.Orders.AddAsync(order, ct);

    public Task UpdateAsync(Order order, CancellationToken ct = default)
    {
        // Itens novos (criados fora do tracker) → Added
        foreach (var item in order.Items)
        {
            var entry = context.Entry(item);
            if (entry.State == EntityState.Detached)
                entry.State = EntityState.Added;
        }

        // Itens que foram removidos da coleção mas ainda estão no tracker → Deleted
        var removedItems = context.ChangeTracker
            .Entries<OrderItem>()
            .Where(e => e.Entity.OrderId == order.Id
                     && e.State == EntityState.Unchanged
                     && !order.Items.Any(i => i.Id == e.Entity.Id));

        foreach (var entry in removedItems)
            entry.State = EntityState.Deleted;

        return Task.CompletedTask;
    }
}
