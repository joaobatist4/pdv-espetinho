using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Orders.Commands.CloseOrder;

public record CloseOrderCommand(Guid OrderId, Guid AttendantId, List<PaymentInput> Payments)
    : IRequest<Result<Guid>>;

public record PaymentInput(PaymentMethod Method, decimal Amount);
