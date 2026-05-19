using PdvEspetinho.Application.Interfaces.Services;
using PdvEspetinho.Domain.Dtos;
using PdvEspetinho.Domain.Events;

namespace PdvEspetinho.Infra.Data;

public class EventDispatcher(MessageBus messageBus, IOrderKitchenNotifier kitchenNotifier)
{
    public readonly MessageBus _messageBus = messageBus;
    public readonly IOrderKitchenNotifier _kitchenNotifier = kitchenNotifier;

    public async Task DispatchAsync(IEnumerable<IDomainEvent> events, CancellationToken cancellationToken = default)
    {
        foreach (var groupedEvents in events.GroupBy(e => e.GetType()))
        {
            foreach (var @event in groupedEvents)
            {
                await DispatchAsync(@event, cancellationToken);
            }
        }
    }

    private Task DispatchAsync(IDomainEvent @event, CancellationToken cancellationToken = default)
    {
        if (@event is OrderItemsAddedEvent itemsAddedEvent)
        {
            return _messageBus.HandleAddedItemsAtOrderAsync(itemsAddedEvent, cancellationToken);
        }

        return Task.CompletedTask;
    }
}
