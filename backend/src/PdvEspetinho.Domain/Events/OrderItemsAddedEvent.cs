namespace PdvEspetinho.Domain.Events;

public record OrderItemsAddedEvent(Guid OrderId, Guid TableId) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
