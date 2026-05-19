using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Events;

namespace PdvEspetinho.Domain.Entities;

public class Order : AggregateRoot
{
    public Guid TableId { get; private set; }
    public Table? Table { get; private set; }
    public Guid AttendantId { get; private set; }
    public User Attendant { get; private set; }
    public Guid? EmployeeId { get; private set; }
    public Employee? Employee { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTime OpenedAt { get; private set; }
    public DateTime? ClosedAt { get; private set; }

    private readonly List<OrderItem> _items = [];
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();

    private Order() { }

    public static Order Create(Table table, User attendant, Employee? employee = null)
    {
        var order = new Order
        {
            TableId = table.Id,
            Table = table,
            AttendantId = attendant.Id,
            Attendant = attendant,
            EmployeeId = employee?.Id,
            Employee = employee,
            Status = OrderStatus.Open,
            OpenedAt = DateTime.UtcNow
        };
        order.AddDomainEvent(new OrderCreatedEvent(order));
        return order;
    }

    public void AddItems(IEnumerable<OrderItem> items)
    {
        foreach (var item in items)
        {
            var existing = _items.FirstOrDefault(i => i.ProductId == item.ProductId);
            if (existing is not null)
                existing.AddQuantity(item.Quantity);
            else
                _items.Add(item);
        }
        AddDomainEvent(new OrderItemsAddedEvent(items, this));
        SetUpdatedAt();
    }

    public bool RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item is null) return false;
        _items.Remove(item);
        SetUpdatedAt();
        return true;
    }

    public bool AdjustItemQuantity(Guid itemId, int delta)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item is null) return false;

        if (item.Quantity + delta <= 0)
            _items.Remove(item);
        else
            item.AddQuantity(delta);

        SetUpdatedAt();
        return true;
    }

    public bool UpdateItemStatus(Guid itemId, OrderItemStatus status)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item is null) return false;
        item.UpdateStatus(status);
        AddDomainEvent(new OrderItemStatusChangedEvent(Id, itemId, TableId, status));
        SetUpdatedAt();
        return true;
    }

    public void Close()
    {
        Status = OrderStatus.Closed;
        ClosedAt = DateTime.UtcNow;
        var total = _items.Sum(i => i.Total);
        AddDomainEvent(new OrderClosedEvent(Id, TableId, total));
        SetUpdatedAt();
    }

    public void Cancel()
    {
        Status = OrderStatus.Cancelled;
        ClosedAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public decimal Total => _items.Sum(i => i.Total);
}
