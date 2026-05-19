using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.AdjustOrderItemQuantity;

public class AdjustOrderItemQuantityCommandHandler(
    IOrderRepository orderRepository,
    ITableRepository tableRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<AdjustOrderItemQuantityCommand, Result>
{
    public async Task<Result> Handle(AdjustOrderItemQuantityCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, OrderIncludes.Items, ct);
        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (!order.AdjustItemQuantity(request.ItemId, request.Delta))
            return Result.Fail("Item não encontrado no pedido.");

        await orderRepository.UpdateAsync(order, ct);

        // Se ficou sem itens, libera a mesa
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
