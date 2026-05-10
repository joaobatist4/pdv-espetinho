namespace PdvEspetinho.Application.Common.Interfaces;

public interface IKitchenNotifier
{
    Task NotifyNewItemsAsync(Guid orderId, Guid tableId, CancellationToken ct = default);
    Task NotifyItemStatusChangedAsync(Guid orderId, Guid itemId, string newStatus, CancellationToken ct = default);
}
