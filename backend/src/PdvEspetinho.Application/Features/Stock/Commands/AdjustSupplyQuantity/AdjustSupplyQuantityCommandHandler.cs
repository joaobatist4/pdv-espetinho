using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustSupplyQuantity;

public class AdjustSupplyQuantityCommandHandler(
    ISupplyRepository supplyRepository,
    IStockMovementRepository stockMovementRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<AdjustSupplyQuantityCommand, Result>
{
    public async Task<Result> Handle(AdjustSupplyQuantityCommand request, CancellationToken ct)
    {
        var supply = await supplyRepository.GetByIdAsync(request.SupplyId, ct);
        if (supply is null)
            return Result.Fail("Insumo não encontrado.");

        var antes = supply.Quantity;
        supply.AdjustQuantity(request.Delta);
        await supplyRepository.UpdateAsync(supply, ct);

        var movement = StockMovement.ForSupply(request.SupplyId, request.Type, antes, supply.Quantity);
        await stockMovementRepository.AddAsync(movement, ct);

        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
