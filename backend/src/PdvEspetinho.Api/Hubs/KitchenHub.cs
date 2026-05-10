using Microsoft.AspNetCore.SignalR;

namespace PdvEspetinho.Api.Hubs;

public class KitchenHub : Hub
{
    public async Task JoinKitchen() =>
        await Groups.AddToGroupAsync(Context.ConnectionId, "kitchen");

    public async Task LeaveKitchen() =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "kitchen");
}
