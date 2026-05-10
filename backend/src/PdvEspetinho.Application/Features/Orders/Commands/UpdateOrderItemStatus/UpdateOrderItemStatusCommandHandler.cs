using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.UpdateOrderItemStatus;

public class UpdateOrderItemStatusCommandHandler(
    IOrderRepository orderRepository,
    IKitchenNotifier kitchenNotifier,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateOrderItemStatusCommand, Result>
{
    public async Task<Result> Handle(UpdateOrderItemStatusCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (!order.UpdateItemStatus(request.ItemId, request.NewStatus))
            return Result.Fail("Item não encontrado no pedido.");

        await orderRepository.UpdateAsync(order, ct);
        await unitOfWork.CommitAsync(ct);

        await kitchenNotifier.NotifyItemStatusChangedAsync(
            request.OrderId, request.ItemId, request.NewStatus.ToString(), ct);

        return Result.Ok();
    }
}
