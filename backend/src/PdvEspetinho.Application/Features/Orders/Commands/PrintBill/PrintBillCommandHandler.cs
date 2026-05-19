using FluentResults;
using MediatR;
using PdvEspetinho.Application.Interfaces.Services;
using PdvEspetinho.Domain.Dtos;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.PrintBill;

public class PrintBillCommandHandler(
    IOrderRepository orderRepository,
    IOrderKitchenNotifier notifier) : IRequestHandler<PrintBillCommand, Result>
{
    public async Task<Result> Handle(PrintBillCommand request, CancellationToken ct)
    {
        var order = await orderRepository.GetByIdAsync(
            request.OrderId,
            OrderIncludes.Items | OrderIncludes.Table | OrderIncludes.Employee,
            ct);

        if (order is null)
            return Result.Fail("Pedido não encontrado.");

        if (order.Status == OrderStatus.Cancelled)
            return Result.Fail("Pedido cancelado.");

        var items = order.Items
            .Select(i => new BillPrintItemDto(i.ProductName, i.Quantity, i.UnitPrice))
            .ToList();

        var bill = new BillPrintDto(
            order.Table?.Label ?? string.Empty,
            order.Employee?.Name,
            DateTime.Now,
            items);

        await notifier.NotifyBillAsync(bill, ct);
        return Result.Ok();
    }
}
