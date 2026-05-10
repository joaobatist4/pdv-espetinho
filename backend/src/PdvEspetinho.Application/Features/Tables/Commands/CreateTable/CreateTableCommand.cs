using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Tables.Commands.CreateTable;

public record CreateTableCommand(string Label, TableType Type) : IRequest<Result<Guid>>;
