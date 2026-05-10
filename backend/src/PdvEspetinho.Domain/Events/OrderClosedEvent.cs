namespace PdvEspetinho.Domain.Events;

public record OrderClosedEvent(Guid OrderId, Guid TableId, decimal TotalAmount) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
