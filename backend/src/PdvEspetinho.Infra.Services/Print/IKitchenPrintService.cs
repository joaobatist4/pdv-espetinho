namespace PdvEspetinho.Infra.Services.Print;

public interface IKitchenPrintService
{
    Task PrintAsync(string tableLabel, IEnumerable<KitchenPrintItem> items, string? employeeName = null, CancellationToken ct = default);
}

public record KitchenPrintItem(string ProductName, int Quantity, string? Note);
