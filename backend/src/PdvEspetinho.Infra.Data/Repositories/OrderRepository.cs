using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class OrderRepository(ApplicationContext context) : IOrderRepository
{
    private readonly ApplicationContext _context = context;
    public Task<Order?> GetByIdAsync(Guid id, OrderIncludes includes = OrderIncludes.None, CancellationToken ct = default) =>
        _context
            .Orders
            .Includes(includes)
            .FirstOrDefaultAsync(o => o.Id == id, ct);

    public Task<Order?> GetOpenByTableAsync(Guid tableId, CancellationToken ct = default) =>
        _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.TableId == tableId && o.Status == OrderStatus.Open, ct);

    public async Task<IEnumerable<Order>> GetOpenOrdersAsync(CancellationToken ct = default) =>
        await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.Status == OrderStatus.Open)
            .OrderBy(o => o.OpenedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Order order, CancellationToken ct = default) =>
        await _context.Orders.AddAsync(order, ct);

    public Task UpdateAsync(Order order, CancellationToken ct = default)
    {
        return Task.CompletedTask;
    }
}

public static class OrderRepositoryExtensions
{
    public static IQueryable<Order> Includes(this IQueryable<Order> query, OrderIncludes includes)
    {
        if (includes.HasFlag(OrderIncludes.Items))
            query = query.Include(o => o.Items);
        if (includes.HasFlag(OrderIncludes.Table))
            query = query.Include(o => o.Table);
        if (includes.HasFlag(OrderIncludes.Attendant))
            query = query.Include(o => o.Attendant);
        if (includes.HasFlag(OrderIncludes.Employee))
            query = query.Include(o => o.Employee);
        return query;
    }
}
