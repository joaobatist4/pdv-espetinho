using PdvEspetinho.Domain.Common;

namespace PdvEspetinho.Domain.Entities;

public class Supply : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string CategorySlug { get; private set; } = string.Empty;
    public string Unit { get; private set; } = string.Empty;
    public decimal CostPerUnit { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal MinimumQuantity { get; private set; }
    public string Supplier { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    private Supply() { }

    public static Supply Create(
        string name,
        string categorySlug,
        string unit,
        decimal costPerUnit,
        decimal quantity,
        decimal minimumQuantity,
        string supplier)
    {
        return new Supply
        {
            Name = name,
            CategorySlug = categorySlug,
            Unit = unit,
            CostPerUnit = costPerUnit,
            Quantity = quantity,
            MinimumQuantity = minimumQuantity,
            Supplier = supplier,
            IsActive = true
        };
    }

    public void Update(string name, string categorySlug, string unit, decimal costPerUnit, decimal minimumQuantity, string supplier)
    {
        Name = name;
        CategorySlug = categorySlug;
        Unit = unit;
        CostPerUnit = costPerUnit;
        MinimumQuantity = minimumQuantity;
        Supplier = supplier;
        SetUpdatedAt();
    }

    public void AdjustQuantity(decimal delta)
    {
        Quantity += delta;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public bool IsBelowMinimum => Quantity <= MinimumQuantity;
}
