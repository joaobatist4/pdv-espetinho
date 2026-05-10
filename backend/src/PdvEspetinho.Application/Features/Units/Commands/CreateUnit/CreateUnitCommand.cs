using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Units.Commands.CreateUnit;

public record CreateUnitCommand(string Name, string Label, int SortOrder) : IRequest<Result<Guid>>;
