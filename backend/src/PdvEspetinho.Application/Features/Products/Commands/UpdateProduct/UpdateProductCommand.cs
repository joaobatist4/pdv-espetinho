using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Products.Commands.UpdateProduct;

public record UpdateProductCommand(
    Guid Id,
    string Name,
    string Subcategory,
    decimal Price,
    string Unit,
    bool GoesToKitchen,
    bool HasStock,
    bool IsActive) : IRequest<Result>;
