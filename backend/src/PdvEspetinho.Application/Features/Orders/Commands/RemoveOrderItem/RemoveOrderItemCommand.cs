using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Orders.Commands.RemoveOrderItem;

public record RemoveOrderItemCommand(Guid OrderId, Guid ItemId) : IRequest<Result>;
