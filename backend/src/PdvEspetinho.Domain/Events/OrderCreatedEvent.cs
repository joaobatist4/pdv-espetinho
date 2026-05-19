using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Events;

public record OrderCreatedEvent(Order Order) : IDomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
}
