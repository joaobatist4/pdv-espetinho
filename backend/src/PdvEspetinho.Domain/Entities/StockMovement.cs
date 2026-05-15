using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Entities;

public class StockMovement : Entity
{
    public Guid? ProductId { get; private set; }
    public Guid? SupplyId { get; private set; }
    public MovementType Type { get; private set; }
    public decimal QuantidadeAntes { get; private set; }
    public decimal QuantidadeDepois { get; private set; }

    private StockMovement() { }

    public static StockMovement ForProduct(Guid productId, MovementType type, decimal antes, decimal depois) =>
        new() { ProductId = productId, Type = type, QuantidadeAntes = antes, QuantidadeDepois = depois };

    public static StockMovement ForSupply(Guid supplyId, MovementType type, decimal antes, decimal depois) =>
        new() { SupplyId = supplyId, Type = type, QuantidadeAntes = antes, QuantidadeDepois = depois };
}
