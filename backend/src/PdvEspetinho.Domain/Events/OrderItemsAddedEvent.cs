using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Events;

public record OrderItemsAddedEvent(IEnumerable<OrderItem> OrderItems, Order Order) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
