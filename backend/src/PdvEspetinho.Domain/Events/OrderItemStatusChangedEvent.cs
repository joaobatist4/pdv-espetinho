using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Events;

public record OrderItemStatusChangedEvent(
    Guid OrderId,
    Guid OrderItemId,
    Guid TableId,
    OrderItemStatus NewStatus) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
