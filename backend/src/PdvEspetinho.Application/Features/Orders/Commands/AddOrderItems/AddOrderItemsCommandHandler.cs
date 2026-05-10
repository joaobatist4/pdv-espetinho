using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.AddOrderItems;

public class AddOrderItemsCommandHandler(
    IOrderRepository orderRepository,
    ITableRepository tableRepository,
    IKitchenNotifier kitchenNotifier) : IRequestHandler<AddOrderItemsCommand, Result>
{
    public async Task<Result> Handle(AddOrderItemsCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (order.Status != OrderStatus.Aberto)
            return Result.Fail("Pedido não está aberto.");

        var items = request.Items.Select(i => (i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, i.GoesToKitchen));
        order.AddItems(items);
        await orderRepository.UpdateAsync(order, ct);

        var table = await tableRepository.GetByIdAsync(order.TableId, ct);
        if (table is not null && table.Status == TableStatus.Livre)
        {
            table.SetStatus(TableStatus.Ocupada);
            await tableRepository.UpdateAsync(table, ct);
        }

        await kitchenNotifier.NotifyNewItemsAsync(order.Id, order.TableId, ct);

        return Result.Ok();
    }
}
