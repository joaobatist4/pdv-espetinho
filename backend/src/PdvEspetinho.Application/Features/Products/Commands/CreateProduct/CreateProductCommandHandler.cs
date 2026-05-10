using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandHandler(
    IProductRepository productRepository,
    IStockItemRepository stockItemRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateProductCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken ct)
    {
        var product = Product.Create(
            request.Name, request.CategoryId, request.Subcategory,
            request.Price, request.Unit, request.GoesToKitchen, request.HasStock);

        await productRepository.AddAsync(product, ct);

        if (request.HasStock)
        {
            var stock = StockItem.Create(product.Id, 0, 5);
            await stockItemRepository.AddAsync(stock, ct);
        }

        await unitOfWork.CommitAsync(ct);
        return Result.Ok(product.Id);
    }
}
