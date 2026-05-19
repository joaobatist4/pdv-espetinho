using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.RemoveOrderItem;

public class RemoveOrderItemCommandHandler(
    IOrderRepository orderRepository,
    ITableRepository tableRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<RemoveOrderItemCommand, Result>
{
    public async Task<Result> Handle(RemoveOrderItemCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, OrderIncludes.Items, ct);
        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (!order.RemoveItem(request.ItemId))
            return Result.Fail("Item não encontrado no pedido.");

        await orderRepository.UpdateAsync(order, ct);

        if (order.Items.Count == 0)
        {
            var table = await tableRepository.GetByIdAsync(order.TableId, ct);
            if (table is not null && table.Status == TableStatus.Occupied)
            {
                table.SetStatus(TableStatus.Available);
                await tableRepository.UpdateAsync(table, ct);
            }
        }

        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
