using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustSupplyQuantity;

public class AdjustSupplyQuantityCommandHandler(
    ISupplyRepository supplyRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<AdjustSupplyQuantityCommand, Result>
{
    public async Task<Result> Handle(AdjustSupplyQuantityCommand request, CancellationToken ct)
    {
        var supply = await supplyRepository.GetByIdAsync(request.SupplyId, ct);
        if (supply is null)
            return Result.Fail("Insumo não encontrado.");

        supply.AdjustQuantity(request.Delta);
        await supplyRepository.UpdateAsync(supply, ct);
        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
