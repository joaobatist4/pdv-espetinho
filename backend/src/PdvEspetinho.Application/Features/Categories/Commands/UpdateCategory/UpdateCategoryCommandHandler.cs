using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Categories.Commands.UpdateCategory;

public class UpdateCategoryCommandHandler(
    ICategoryRepository repository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateCategoryCommand, Result>
{
    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken ct)
    {
        var category = await repository.GetByIdAsync(request.Id, ct);
        if (category is null)
            return Result.Fail("Categoria não encontrada.");

        category.Update(request.Name, request.Icon, request.SortOrder);
        await repository.UpdateAsync(category, ct);
        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
