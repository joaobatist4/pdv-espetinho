using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Products.Commands.UpdateProduct;

public class UpdateProductCommandHandler(
    IProductRepository productRepository,
    IStockItemRepository stockItemRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateProductCommand, Result>
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

        if (request.HasStock)
        {
            var existing = await stockItemRepository.GetByProductIdAsync(product.Id, ct);
            if (existing is null)
            {
                var stock = StockItem.Create(product.Id, 0, 5);
                await stockItemRepository.AddAsync(stock, ct);
            }
        }

        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
