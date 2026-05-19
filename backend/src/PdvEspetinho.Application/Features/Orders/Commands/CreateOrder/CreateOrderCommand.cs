using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Orders.Commands.CreateOrder;

public record CreateOrderCommand(Guid TableId, Guid AttendantId, Guid EmployeeId) : IRequest<Result<Guid>>;
