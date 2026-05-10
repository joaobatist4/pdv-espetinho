using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Events;

namespace PdvEspetinho.Domain.Entities;

public class Order : Entity
{
    public Guid TableId { get; private set; }
    public Guid AttendantId { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTime OpenedAt { get; private set; }
    public DateTime? ClosedAt { get; private set; }

    private readonly List<OrderItem> _items = [];
    public IReadOnlyList<OrderItem> Items => _items.AsReadOnly();

    private readonly List<IDomainEvent> _domainEvents = [];
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    private Order() { }

    public static Order Create(Guid tableId, Guid attendantId)
    {
        var order = new Order
        {
            TableId = tableId,
            AttendantId = attendantId,
            Status = OrderStatus.Aberto,
            OpenedAt = DateTime.UtcNow
        };
        order._domainEvents.Add(new OrderCreatedEvent(order.Id, tableId, attendantId));
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
        _domainEvents.Add(new OrderItemsAddedEvent(Id, TableId));
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
        _domainEvents.Add(new OrderItemStatusChangedEvent(Id, itemId, TableId, status));
        SetUpdatedAt();
        return true;
    }

    public void Close()
    {
        Status = OrderStatus.Fechado;
        ClosedAt = DateTime.UtcNow;
        var total = _items.Sum(i => i.Total);
        _domainEvents.Add(new OrderClosedEvent(Id, TableId, total));
        SetUpdatedAt();
    }

    public void Cancel()
    {
        Status = OrderStatus.Cancelado;
        ClosedAt = DateTime.UtcNow;
        SetUpdatedAt();
    }

    public void ClearDomainEvents() => _domainEvents.Clear();

    public decimal Total => _items.Sum(i => i.Total);
}
