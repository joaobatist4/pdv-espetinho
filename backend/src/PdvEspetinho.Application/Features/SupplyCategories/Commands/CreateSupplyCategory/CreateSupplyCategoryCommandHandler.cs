using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.SupplyCategories.Commands.CreateSupplyCategory;

public class CreateSupplyCategoryCommandHandler(ISupplyCategoryRepository repository) : IRequestHandler<CreateSupplyCategoryCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateSupplyCategoryCommand request, CancellationToken ct)
    {
        var cat = SupplyCategory.Create(request.Name, request.Slug, request.Icon, request.SortOrder);
        await repository.AddAsync(cat, ct);
        return Result.Ok(cat.Id);
    }
}
