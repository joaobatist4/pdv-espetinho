using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Units.Commands.CreateUnit;

public class CreateUnitCommandHandler(
    IUnitRepository repository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateUnitCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateUnitCommand request, CancellationToken ct)
    {
        var unit = Domain.Entities.Unit.Create(request.Name, request.Label, request.SortOrder);
        await repository.AddAsync(unit, ct);
        await unitOfWork.CommitAsync(ct);
        return Result.Ok(unit.Id);
    }
}
