using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Orders.Commands.UpdateOrderItemStatus;

public record UpdateOrderItemStatusCommand(Guid OrderId, Guid ItemId, OrderItemStatus NewStatus)
    : IRequest<Result>;
