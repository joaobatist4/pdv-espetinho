using FluentValidation;

namespace PdvEspetinho.Application.Features.Orders.Commands.AddOrderItems;

public class AddOrderItemsCommandValidator : AbstractValidator<AddOrderItemsCommand>
{
    public AddOrderItemsCommandValidator()
    {
        RuleFor(x => x.OrderId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("Adicione ao menos um item.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}
