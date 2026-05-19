using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Employees.Commands.CreateEmployee;

public record CreateEmployeeCommand(string Name) : IRequest<Result<Guid>>;
