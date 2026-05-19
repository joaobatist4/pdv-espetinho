using PdvEspetinho.Application.Interfaces.Services;
using PdvEspetinho.Domain.Dtos;
using PdvEspetinho.Domain.Events;

namespace PdvEspetinho.Infra.Data;

public class MessageBus(IOrderKitchenNotifier kitchenNotifier)
{
    public readonly IOrderKitchenNotifier _kitchenNotifier = kitchenNotifier;

    public async Task HandleAddedItemsAtOrderAsync(OrderItemsAddedEvent message, CancellationToken ct = default)
    {
        var items = message.OrderItems.Where(i => i.GoesToKitchen).ToList();

        if(items.Count == 0)
            return;

        var kitchenPrintMessage = new KitchenPrintDto
        (
            message.Order.Table?.Label ?? "Sem mesa",
            message.Order.Employee?.Name ?? "Balcão",
            [.. items.Select(i => new KitchenPrintItemDto
            (
                i.ProductName,
                i.Quantity,
                i.Note
            ))]
        );

        await  _kitchenNotifier.NotifyAsync(kitchenPrintMessage, ct);
    }
}