using Microsoft.AspNetCore.SignalR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Api.Hubs;

namespace PdvEspetinho.Api.Services;

public class KitchenNotifier(IHubContext<KitchenHub> hubContext) : IKitchenNotifier
{
    public Task NotifyNewItemsAsync(Guid orderId, Guid tableId, CancellationToken ct = default) =>
        hubContext.Clients.Group("kitchen").SendAsync("NewOrder",
            new { orderId, tableId }, ct);

    public Task NotifyItemStatusChangedAsync(Guid orderId, Guid itemId, string newStatus, CancellationToken ct = default) =>
        hubContext.Clients.Group("kitchen").SendAsync("ItemStatusChanged",
            new { orderId, itemId, newStatus }, ct);
}
