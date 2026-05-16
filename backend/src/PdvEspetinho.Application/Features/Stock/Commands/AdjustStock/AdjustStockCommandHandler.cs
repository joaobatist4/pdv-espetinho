using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustStock;

public class AdjustStockCommandHandler(
    IStockItemRepository stockItemRepository,
    IStockMovementRepository stockMovementRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<AdjustStockCommand, Result>
{
    public async Task<Result> Handle(AdjustStockCommand request, CancellationToken ct)
    {
        var item = await stockItemRepository.GetByProductIdAsync(request.ProductId, ct);

        decimal before;
        if (item is null)
        {
            item = StockItem.Create(request.ProductId, 0, request.NewMinimum ?? 5);
            before = 0;
            item.Adjust(request.Delta);
            await stockItemRepository.AddAsync(item, ct);
        }
        else
        {
            before = item.Quantity;
            item.Adjust(request.Delta);
            if (request.NewMinimum.HasValue) item.SetMinimum(request.NewMinimum.Value);
            await stockItemRepository.UpdateAsync(item, ct);
        }

        var movement = StockMovement.ForProduct(request.ProductId, request.Type, before, item.Quantity);
        await stockMovementRepository.AddAsync(movement, ct);

        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
