using FluentValidation;

namespace PdvEspetinho.Application.Features.Categories.Commands.CreateCategory;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Slug).NotEmpty().MaximumLength(50).Matches(@"^[a-z0-9_]+$").WithMessage("Slug deve conter apenas letras minúsculas, números e _");
    }
}
