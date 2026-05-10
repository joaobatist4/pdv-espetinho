using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.CloseOrder;

public class CloseOrderCommandHandler(
    IOrderRepository orderRepository,
    ISaleRepository saleRepository,
    ITableRepository tableRepository) : IRequestHandler<CloseOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CloseOrderCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Fail<Guid>("Pedido não encontrado.");

        if (order.Status != OrderStatus.Aberto)
            return Result.Fail<Guid>("Pedido não está aberto.");

        var paidTotal = request.Payments.Sum(p => p.Amount);
        if (Math.Abs(paidTotal - order.Total) > 0.01m)
            return Result.Fail<Guid>($"Valor pago ({paidTotal:C}) diferente do total ({order.Total:C}).");

        order.Close();
        await orderRepository.UpdateAsync(order, ct);

        var paymentMethod = request.Payments.Count == 1
            ? request.Payments[0].Method
            : PaymentMethod.Misto;

        var sale = Sale.Create(
            order.Id,
            request.AttendantId,
            order.Total,
            request.Payments.Select(p => (p.Method, p.Amount)));

        await saleRepository.AddAsync(sale, ct);

        var table = await tableRepository.GetByIdAsync(order.TableId, ct);
        if (table is not null)
        {
            table.SetStatus(TableStatus.Livre);
            await tableRepository.UpdateAsync(table, ct);
        }

        return Result.Ok(sale.Id);
    }
}
