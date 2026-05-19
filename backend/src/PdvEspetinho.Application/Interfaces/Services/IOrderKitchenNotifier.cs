using PdvEspetinho.Domain.Dtos;

namespace PdvEspetinho.Application.Interfaces.Services;

public interface IOrderKitchenNotifier
{
    Task NotifyAsync(KitchenPrintDto job, CancellationToken ct = default);
    Task NotifyBillAsync(BillPrintDto bill, CancellationToken ct = default);
}
