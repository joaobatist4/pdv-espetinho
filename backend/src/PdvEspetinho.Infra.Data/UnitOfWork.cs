using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Application.Interfaces.Services;
using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Dtos;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Events;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data;

public class UnitOfWork(ApplicationContext context, EventDispatcher dispatcher) : IUnitOfWork
{
    public readonly ApplicationContext _context = context;
    public readonly EventDispatcher _dispatcher = dispatcher;
    public async Task CommitAsync(CancellationToken ct = default)
    {
        var entities = _context.ChangeTracker.Entries<AggregateRoot>()
            .Select(e => e.Entity)
            .ToList();

        await _context.SaveChangesAsync(ct);

        foreach (var entity in entities)
            await _dispatcher.DispatchAsync(entity.DomainEvents, ct);
    }

    // private async Task<List<KitchenPrintDto>> CollectKitchenTicketsAsync(CancellationToken ct)
    // {
    //     var newKitchenItems = _context.ChangeTracker
    //         .Entries<OrderItem>()
    //         .Where(e => e.State == EntityState.Added && e.Entity.GoesToKitchen)
    //         .Select(e => e.Entity)
    //         .ToList();

    //     if (newKitchenItems.Count == 0)
    //         return [];

    //     var trackedOrders = _context.ChangeTracker
    //         .Entries<Order>()
    //         .Select(e => e.Entity)
    //         .ToDictionary(o => o.Id);

    //     var trackedTables = _context.ChangeTracker
    //         .Entries<Table>()
    //         .Select(e => e.Entity)
    //         .ToDictionary(t => t.Id);

    //     var trackedEmployees = _context.ChangeTracker
    //         .Entries<Employee>()
    //         .Select(e => e.Entity)
    //         .ToDictionary(e => e.Id);

    //     var tickets = new List<KitchenPrintDto>();

    //     foreach (var group in newKitchenItems.GroupBy(i => i.OrderId))
    //     {
    //         if (!trackedOrders.TryGetValue(group.Key, out var order))
    //             continue;

    //         var tableLabel = trackedTables.TryGetValue(order.TableId, out var table)
    //             ? table.Label
    //             : order.TableId.ToString();

    //         string? employeeName = null;
    //         if (order.EmployeeId.HasValue)
    //         {
    //             if (!trackedEmployees.TryGetValue(order.EmployeeId.Value, out var employee))
    //                 employee = await _context.Set<Employee>().FindAsync([order.EmployeeId.Value], ct);

    //             employeeName = employee?.Name;
    //         }

    //         var items = group
    //             .Select(i => new KitchenPrintItemDto(i.ProductName, i.Quantity, i.Note))
    //             .ToList();

    //         tickets.Add(new KitchenPrintDto(tableLabel, employeeName, items));
    //     }

    //     return tickets;
    // }
}
