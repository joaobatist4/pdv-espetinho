namespace PdvEspetinho.QueryStack.Queries.Stock;

public record StockItemDto(
    Guid ProductId,
    string ProductName,
    string CategorySlug,
    int Quantity,
    int MinimumQuantity,
    bool IsBelowMinimum);

public record SupplyDto(
    Guid Id,
    string Name,
    string CategorySlug,
    string Unit,
    decimal CostPerUnit,
    decimal Quantity,
    decimal MinimumQuantity,
    string Supplier,
    bool IsBelowMinimum);
