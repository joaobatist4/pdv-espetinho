using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.RemoveOrderItem;

public class RemoveOrderItemCommandHandler(
    IOrderRepository orderRepository,
    ITableRepository tableRepository)
    : IRequestHandler<RemoveOrderItemCommand, Result>
{
    public async Task<Result> Handle(RemoveOrderItemCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (!order.RemoveItem(request.ItemId))
            return Result.Fail("Item não encontrado no pedido.");

        await orderRepository.UpdateAsync(order, ct);

        if (order.Items.Count == 0)
        {
            var table = await tableRepository.GetByIdAsync(order.TableId, ct);
            if (table is not null && table.Status == TableStatus.Ocupada)
            {
                table.SetStatus(TableStatus.Livre);
                await tableRepository.UpdateAsync(table, ct);
            }
        }

        return Result.Ok();
    }
}
