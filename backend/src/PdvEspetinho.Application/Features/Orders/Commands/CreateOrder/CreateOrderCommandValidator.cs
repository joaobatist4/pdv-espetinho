using FluentValidation;

namespace PdvEspetinho.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.TableId).NotEmpty();
        RuleFor(x => x.AttendantId).NotEmpty();
    }
}
