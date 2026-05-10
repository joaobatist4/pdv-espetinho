using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Units.Commands.UpdateUnit;

public class UpdateUnitCommandHandler(
    IUnitRepository repository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateUnitCommand, Result>
{
    public async Task<Result> Handle(UpdateUnitCommand request, CancellationToken ct)
    {
        var unit = await repository.GetByIdAsync(request.Id, ct);
        if (unit is null)
            return Result.Fail("Unidade não encontrada.");

        unit.Update(request.Name, request.Label, request.SortOrder);
        await repository.UpdateAsync(unit, ct);
        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
