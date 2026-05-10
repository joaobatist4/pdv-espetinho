using PdvEspetinho.Domain.Common;

namespace PdvEspetinho.Domain.Entities;

public class Product : Entity
{
    public string Name { get; private set; } = string.Empty;
    public Guid CategoryId { get; private set; }
    public string Subcategory { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public string Unit { get; private set; } = string.Empty;
    public bool GoesToKitchen { get; private set; }
    public bool HasStock { get; private set; }
    public bool IsActive { get; private set; }

    public Category? Category { get; private set; }

    private Product() { }

    public static Product Create(
        string name,
        Guid categoryId,
        string subcategory,
        decimal price,
        string unit,
        bool goesToKitchen,
        bool hasStock)
    {
        return new Product
        {
            Name = name,
            CategoryId = categoryId,
            Subcategory = subcategory,
            Price = price,
            Unit = unit,
            GoesToKitchen = goesToKitchen,
            HasStock = hasStock,
            IsActive = true
        };
    }

    public void Update(string name, string subcategory, decimal price, string unit, bool goesToKitchen, bool hasStock)
    {
        Name = name;
        Subcategory = subcategory;
        Price = price;
        Unit = unit;
        GoesToKitchen = goesToKitchen;
        HasStock = hasStock;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void Toggle()
    {
        if (IsActive) Deactivate(); else Activate();
    }
}
