namespace PdvEspetinho.Domain.Events;

public record OrderCreatedEvent(Guid OrderId, Guid TableId, Guid AttendantId) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
