using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustStock;

public class AdjustStockCommandHandler(
    IStockItemRepository stockItemRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<AdjustStockCommand, Result>
{
    public async Task<Result> Handle(AdjustStockCommand request, CancellationToken ct)
    {
        var item = await stockItemRepository.GetByProductIdAsync(request.ProductId, ct);

        if (item is null)
        {
            item = StockItem.Create(request.ProductId, 0, request.NewMinimum ?? 5);
            item.Adjust(request.Delta);
            await stockItemRepository.AddAsync(item, ct);
        }
        else
        {
            item.Adjust(request.Delta);
            if (request.NewMinimum.HasValue) item.SetMinimum(request.NewMinimum.Value);
            await stockItemRepository.UpdateAsync(item, ct);
        }

        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
