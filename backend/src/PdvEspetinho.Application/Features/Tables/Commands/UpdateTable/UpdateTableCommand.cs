using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Tables.Commands.UpdateTable;

public record UpdateTableCommand(Guid Id, string Label, TableType Type, bool IsActive) : IRequest<Result>;
