using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Employees.Commands.UpdateEmployee;

public record UpdateEmployeeCommand(Guid Id, string Name) : IRequest<Result>;
