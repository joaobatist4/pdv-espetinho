using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Units.Commands.CreateUnit;

public class CreateUnitCommandHandler(IUnitRepository repository) : IRequestHandler<CreateUnitCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateUnitCommand request, CancellationToken ct)
    {
        var unit = Domain.Entities.Unit.Create(request.Name, request.Label, request.SortOrder);
        await repository.AddAsync(unit, ct);
        return Result.Ok(unit.Id);
    }
}
