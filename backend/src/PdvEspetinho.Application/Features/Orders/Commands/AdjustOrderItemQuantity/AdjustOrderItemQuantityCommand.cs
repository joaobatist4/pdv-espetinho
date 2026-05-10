using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Orders.Commands.AdjustOrderItemQuantity;

public record AdjustOrderItemQuantityCommand(Guid OrderId, Guid ItemId, int Delta) : IRequest<Result>;
