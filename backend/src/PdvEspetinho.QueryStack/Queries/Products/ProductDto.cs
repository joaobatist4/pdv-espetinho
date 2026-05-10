namespace PdvEspetinho.QueryStack.Queries.Products;

public record ProductDto(
    Guid Id,
    string Name,
    Guid CategoryId,
    string CategoryName,
    string CategorySlug,
    string Subcategory,
    decimal Price,
    string Unit,
    bool GoesToKitchen,
    bool HasStock,
    bool IsActive);
