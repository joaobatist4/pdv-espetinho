using FluentValidation;

namespace PdvEspetinho.Application.Features.Orders.Commands.CloseOrder;

public class CloseOrderCommandValidator : AbstractValidator<CloseOrderCommand>
{
    public CloseOrderCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.AttendantId).NotEmpty();
        RuleFor(x => x.Payments).NotEmpty().WithMessage("Informe ao menos uma forma de pagamento.");
        RuleForEach(x => x.Payments).ChildRules(p =>
            p.RuleFor(i => i.Amount).GreaterThan(0));
    }
}
