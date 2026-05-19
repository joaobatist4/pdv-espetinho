namespace PdvPrintWorker;

public record PrintJobDto(
    Guid OrderId,
    string TableLabel,
    string? EmployeeName,
    List<PrintJobItem> Items
);

public record PrintJobItem(string ProductName, int Quantity, string? Note);

public record BillPrintDto(
    string TableLabel,
    string? EmployeeName,
    DateTime PrintedAt,
    List<BillPrintItem> Items
)
{
    public decimal Total => Items.Sum(i => i.ItemTotal);
}

public record BillPrintItem(string ProductName, int Quantity, decimal UnitPrice)
{
    public decimal ItemTotal => Quantity * UnitPrice;
}
