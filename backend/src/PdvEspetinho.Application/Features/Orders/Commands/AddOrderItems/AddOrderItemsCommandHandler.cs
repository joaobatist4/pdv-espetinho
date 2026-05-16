using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.AddOrderItems;

public class AddOrderItemsCommandHandler(
    IOrderRepository orderRepository,
    IProductRepository productRepository,
    ITableRepository tableRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<AddOrderItemsCommand, Result>
{
    public async Task<Result> Handle(AddOrderItemsCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, ct);
        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (order.Status != OrderStatus.Open)
            return Result.Fail("Pedido não está aberto.");

        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var products = await productRepository.GetByIdsAsync(productIds, ct);

        var missing = productIds.Except(products.Select(p => p.Id)).ToList();
        if (missing.Count > 0)
            return Result.Fail($"Produto(s) não encontrado(s): {string.Join(", ", missing)}");

        var orderItems = request.Items
            .Join(products, item => item.ProductId, product => product.Id,
                (item, product) => OrderItem.Create(order.Id, product.Id, product.Name, product.Price, item.Quantity, product.GoesToKitchen))
            .ToList();

        order.AddItems(orderItems);
        await orderRepository.UpdateAsync(order, ct);

        var table = await tableRepository.GetByIdAsync(order.TableId, ct);
        if (table is not null && table.Status == TableStatus.Available)
        {
            table.SetStatus(TableStatus.Occupied);
            await tableRepository.UpdateAsync(table, ct);
        }

        await unitOfWork.CommitAsync(ct);

        return Result.Ok();
    }
}
