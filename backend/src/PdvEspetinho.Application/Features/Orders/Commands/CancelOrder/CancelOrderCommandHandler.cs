using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderCommandHandler(
    IOrderRepository orderRepository,
    ITableRepository tableRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CancelOrderCommand, Result>
{
    public async Task<Result> Handle(CancelOrderCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (order.Status != OrderStatus.Aberto)
            return Result.Fail("Pedido não está aberto.");

        order.Cancel();
        await orderRepository.UpdateAsync(order, ct);

        var table = await tableRepository.GetByIdAsync(order.TableId, ct);
        if (table is not null)
        {
            table.SetStatus(TableStatus.Livre);
            await tableRepository.UpdateAsync(table, ct);
        }

        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
