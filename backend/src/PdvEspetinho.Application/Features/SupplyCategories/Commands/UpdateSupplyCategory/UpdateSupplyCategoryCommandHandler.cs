using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.SupplyCategories.Commands.UpdateSupplyCategory;

public class UpdateSupplyCategoryCommandHandler(ISupplyCategoryRepository repository) : IRequestHandler<UpdateSupplyCategoryCommand, Result>
{
    public async Task<Result> Handle(UpdateSupplyCategoryCommand request, CancellationToken ct)
    {
        var cat = await repository.GetByIdAsync(request.Id, ct);
        if (cat is null)
            return Result.Fail("Categoria de insumo não encontrada.");

        cat.Update(request.Name, request.Icon, request.SortOrder);
        await repository.UpdateAsync(cat, ct);
        return Result.Ok();
    }
}
