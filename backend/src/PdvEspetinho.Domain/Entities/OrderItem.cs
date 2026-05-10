using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Entities;

public class OrderItem : Entity
{
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public bool GoesToKitchen { get; private set; }
    public OrderItemStatus Status { get; private set; }

    private OrderItem() { }

    public static OrderItem Create(
        Guid orderId,
        Guid productId,
        string productName,
        decimal unitPrice,
        int quantity,
        bool goesToKitchen)
    {
        return new OrderItem
        {
            OrderId = orderId,
            ProductId = productId,
            ProductName = productName,
            UnitPrice = unitPrice,
            Quantity = quantity,
            GoesToKitchen = goesToKitchen,
            Status = goesToKitchen ? OrderItemStatus.Aguardando : OrderItemStatus.Entregue
        };
    }

    public void AddQuantity(int qty)
    {
        Quantity += qty;
        SetUpdatedAt();
    }

    public void UpdateStatus(OrderItemStatus status)
    {
        Status = status;
        SetUpdatedAt();
    }

    public decimal Total => UnitPrice * Quantity;
}
