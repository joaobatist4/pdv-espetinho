using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.Products.Commands.CreateProduct;
using PdvEspetinho.Application.Features.Products.Commands.UpdateProduct;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.QueryStack.Queries.Products;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController(IMediator mediator, GetProductsQuery getProductsQuery, IProductRepository productRepository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? categoryId, CancellationToken ct)
    {
        var products = await getProductsQuery.ExecuteAsync(categoryId, ct);
        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/products/{result.Value}", new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    {
        var product = await productRepository.GetByIdAsync(id, ct);
        if (product is null) return NotFound();
        product.Toggle();
        await productRepository.UpdateAsync(product, ct);
        return NoContent();
    }
}
