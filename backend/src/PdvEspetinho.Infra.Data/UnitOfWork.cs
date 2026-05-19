using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Infra.Data.Context;
using PdvEspetinho.Infra.Services.Print;

namespace PdvEspetinho.Infra.Data;

public class UnitOfWork(ApplicationContext context, IKitchenPrintService kitchenPrintService) : IUnitOfWork
{
    public async Task CommitAsync(CancellationToken ct = default)
    {
        var tickets = await CollectKitchenTicketsAsync(ct);

        await context.SaveChangesAsync(ct);

        foreach (var (tableLabel, employeeName, items) in tickets)
            await kitchenPrintService.PrintAsync(tableLabel, items, employeeName, ct);
    }

    private async Task<List<(string TableLabel, string? EmployeeName, List<KitchenPrintItem> Items)>> CollectKitchenTicketsAsync(CancellationToken ct)
    {
        var newKitchenItems = context.ChangeTracker
            .Entries<OrderItem>()
            .Where(e => e.State == EntityState.Added && e.Entity.GoesToKitchen)
            .Select(e => e.Entity)
            .ToList();

        if (newKitchenItems.Count == 0)
            return [];

        var trackedOrders = context.ChangeTracker
            .Entries<Order>()
            .Select(e => e.Entity)
            .ToDictionary(o => o.Id);

        var trackedTables = context.ChangeTracker
            .Entries<Table>()
            .Select(e => e.Entity)
            .ToDictionary(t => t.Id);

        var trackedEmployees = context.ChangeTracker
            .Entries<Employee>()
            .Select(e => e.Entity)
            .ToDictionary(e => e.Id);

        var tickets = new List<(string, string?, List<KitchenPrintItem>)>();

        foreach (var group in newKitchenItems.GroupBy(i => i.OrderId))
        {
            if (!trackedOrders.TryGetValue(group.Key, out var order))
                continue;

            var tableLabel = trackedTables.TryGetValue(order.TableId, out var table)
                ? table.Label
                : order.TableId.ToString();

            string? employeeName = null;
            if (order.EmployeeId.HasValue)
            {
                if (!trackedEmployees.TryGetValue(order.EmployeeId.Value, out var employee))
                    employee = await context.Set<Employee>().FindAsync([order.EmployeeId.Value], ct);

                employeeName = employee?.Name;
            }

            var items = group
                .Select(i => new KitchenPrintItem(i.ProductName, i.Quantity, i.Note))
                .ToList();

            tickets.Add((tableLabel, employeeName, items));
        }

        return tickets;
    }
}
