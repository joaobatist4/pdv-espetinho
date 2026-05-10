using PdvEspetinho.Domain.Common;

namespace PdvEspetinho.Domain.Entities;

public class StockItem : Entity
{
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public int MinimumQuantity { get; private set; }

    private StockItem() { }

    public static StockItem Create(Guid productId, int quantity, int minimumQuantity)
    {
        return new StockItem
        {
            ProductId = productId,
            Quantity = quantity,
            MinimumQuantity = minimumQuantity
        };
    }

    public void Adjust(int delta)
    {
        Quantity += delta;
        SetUpdatedAt();
    }

    public void SetMinimum(int minimum)
    {
        MinimumQuantity = minimum;
        SetUpdatedAt();
    }

    public bool IsBelowMinimum => Quantity <= MinimumQuantity;
}
