using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Orders.Commands.PrintBill;

public record PrintBillCommand(Guid OrderId) : IRequest<Result>;
