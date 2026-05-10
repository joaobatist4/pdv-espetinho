using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Entities;

public class SalePayment : Entity
{
    public Guid SaleId { get; private set; }
    public PaymentMethod Method { get; private set; }
    public decimal Amount { get; private set; }

    private SalePayment() { }

    internal static SalePayment Create(Guid saleId, PaymentMethod method, decimal amount)
    {
        return new SalePayment
        {
            SaleId = saleId,
            Method = method,
            Amount = amount
        };
    }
}
