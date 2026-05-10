using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Entities;

public class Sale : Entity
{
    public Guid OrderId { get; private set; }
    public Guid AttendantId { get; private set; }
    public decimal TotalAmount { get; private set; }
    public DateTime ClosedAt { get; private set; }

    private readonly List<SalePayment> _payments = [];
    public IReadOnlyList<SalePayment> Payments => _payments.AsReadOnly();

    private Sale() { }

    public static Sale Create(
        Guid orderId,
        Guid attendantId,
        decimal totalAmount,
        IEnumerable<(PaymentMethod Method, decimal Amount)> payments)
    {
        var sale = new Sale
        {
            OrderId = orderId,
            AttendantId = attendantId,
            TotalAmount = totalAmount,
            ClosedAt = DateTime.UtcNow
        };

        foreach (var (method, amount) in payments)
            sale._payments.Add(SalePayment.Create(sale.Id, method, amount));

        return sale;
    }
}
