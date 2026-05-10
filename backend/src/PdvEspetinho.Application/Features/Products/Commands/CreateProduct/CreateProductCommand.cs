using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Products.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    Guid CategoryId,
    string Subcategory,
    decimal Price,
    string Unit,
    bool GoesToKitchen,
    bool HasStock) : IRequest<Result<Guid>>;
