using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Entities;

public class StockMovement : Entity
{
    public Guid? ProductId { get; private set; }
    public Guid? SupplyId { get; private set; }
    public MovementType Type { get; private set; }
    public decimal QuantityBefore { get; private set; }
    public decimal QuantityAfter { get; private set; }

    private StockMovement() { }

    public static StockMovement ForProduct(Guid productId, MovementType type, decimal before, decimal after) =>
        new() { ProductId = productId, Type = type, QuantityBefore = before, QuantityAfter = after };

    public static StockMovement ForSupply(Guid supplyId, MovementType type, decimal before, decimal after) =>
        new() { SupplyId = supplyId, Type = type, QuantityBefore = before, QuantityAfter = after };
}
