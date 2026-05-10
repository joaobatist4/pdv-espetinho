using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Orders.Commands.CancelOrder;

public record CancelOrderCommand(Guid OrderId) : IRequest<Result>;
