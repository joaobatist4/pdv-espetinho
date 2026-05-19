using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace PdvEspetinho.Api.Hubs;

[Authorize]
public class KitchenHub : Hub
{
    public async Task ReportPrinterStatus(string status)
        => await Clients.All.SendAsync("PrinterAlert", status);
}
