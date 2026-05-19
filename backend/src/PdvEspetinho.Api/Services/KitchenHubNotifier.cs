using Microsoft.AspNetCore.SignalR;
using PdvEspetinho.Api.Hubs;
using PdvEspetinho.Application.Interfaces.Services;
using PdvEspetinho.Domain.Dtos;

namespace PdvEspetinho.Api.Services;

public class KitchenHubNotifier(IHubContext<KitchenHub> hub) : IOrderKitchenNotifier
{
    public Task NotifyAsync(KitchenPrintDto job, CancellationToken ct = default)
        => hub.Clients.All.SendAsync("NewOrder", job, ct);

    public Task NotifyBillAsync(BillPrintDto bill, CancellationToken ct = default)
        => hub.Clients.All.SendAsync("PrintBill", bill, ct);
}
