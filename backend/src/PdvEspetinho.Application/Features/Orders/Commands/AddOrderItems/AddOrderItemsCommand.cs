using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Orders.Commands.AddOrderItems;

public record AddOrderItemsCommand(Guid OrderId, List<OrderItemInput> Items) : IRequest<Result>;

public record OrderItemInput(Guid ProductId, int Quantity);
