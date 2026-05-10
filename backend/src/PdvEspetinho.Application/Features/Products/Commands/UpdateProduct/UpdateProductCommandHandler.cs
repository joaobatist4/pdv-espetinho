using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Products.Commands.UpdateProduct;

public class UpdateProductCommandHandler(IProductRepository productRepository)
    : IRequestHandler<UpdateProductCommand, Result>
{
    public async Task<Result> Handle(UpdateProductCommand request, CancellationToken ct)
    {
        var product = await productRepository.GetByIdAsync(request.Id, ct);
        if (product is null)
            return Result.Fail("Produto não encontrado.");

        product.Update(request.Name, request.Subcategory, request.Price, request.Unit, request.GoesToKitchen, request.HasStock);

        if (!request.IsActive) product.Deactivate();
        else product.Activate();

        await productRepository.UpdateAsync(product, ct);
        return Result.Ok();
    }
}
