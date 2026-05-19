namespace PdvEspetinho.Domain.Dtos;

public record BillPrintDto(
    string TableLabel,
    string? EmployeeName,
    DateTime PrintedAt,
    List<BillPrintItemDto> Items
)
{
    public decimal Total => Items.Sum(i => i.ItemTotal);
}

public record BillPrintItemDto(string ProductName, int Quantity, decimal UnitPrice)
{
    public decimal ItemTotal => Quantity * UnitPrice;
}
