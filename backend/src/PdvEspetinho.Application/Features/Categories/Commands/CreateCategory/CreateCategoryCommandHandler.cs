using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Categories.Commands.CreateCategory;

public class CreateCategoryCommandHandler(ICategoryRepository repository) : IRequestHandler<CreateCategoryCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken ct)
    {
        var category = Category.Create(request.Name, request.Slug, request.Icon, request.SortOrder);
        await repository.AddAsync(category, ct);
        return Result.Ok(category.Id);
    }
}
