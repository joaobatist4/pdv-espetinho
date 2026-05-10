using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Units.Commands.UpdateUnit;

public record UpdateUnitCommand(Guid Id, string Name, string Label, int SortOrder) : IRequest<Result>;
