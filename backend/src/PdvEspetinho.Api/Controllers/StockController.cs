using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.Stock.Commands.AdjustStock;
using PdvEspetinho.Application.Features.Stock.Commands.AdjustSupplyQuantity;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.QueryStack.Queries.Stock;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class StockController(IMediator mediator, GetStockQuery getStockQuery, ISupplyRepository supplyRepository) : ControllerBase
{
    [HttpGet("stock")]
    public async Task<IActionResult> GetStock(CancellationToken ct)
    {
        var items = await getStockQuery.GetStockAsync(ct);
        return Ok(items);
    }

    [HttpPost("stock/adjust")]
    public async Task<IActionResult> AdjustStock([FromBody] AdjustStockCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpGet("supplies")]
    public async Task<IActionResult> GetSupplies(CancellationToken ct)
    {
        var items = await getStockQuery.GetSuppliesAsync(ct);
        return Ok(items);
    }

    [HttpPost("supplies")]
    public async Task<IActionResult> CreateSupply([FromBody] CreateSupplyRequest request, CancellationToken ct)
    {
        var supply = Supply.Create(request.Name, request.CategorySlug, request.Unit,
            request.CostPerUnit, request.Quantity, request.MinimumQuantity, request.Supplier);
        await supplyRepository.AddAsync(supply, ct);
        return Created($"api/supplies/{supply.Id}", new { id = supply.Id });
    }

    [HttpPut("supplies/{id:guid}")]
    public async Task<IActionResult> UpdateSupply(Guid id, [FromBody] UpdateSupplyRequest request, CancellationToken ct)
    {
        var supply = await supplyRepository.GetByIdAsync(id, ct);
        if (supply is null)
            return NotFound();

        supply.Update(request.Name, request.CategorySlug, request.Unit,
            request.CostPerUnit, request.MinimumQuantity, request.Supplier);
        await supplyRepository.UpdateAsync(supply, ct);
        return NoContent();
    }

    [HttpPatch("supplies/{id:guid}/quantity")]
    public async Task<IActionResult> AdjustSupply(Guid id, [FromBody] AdjustSupplyQuantityCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { SupplyId = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }
}

public record CreateSupplyRequest(
    string Name, string CategorySlug, string Unit,
    decimal CostPerUnit, decimal Quantity, decimal MinimumQuantity, string Supplier);

public record UpdateSupplyRequest(
    string Name, string CategorySlug, string Unit,
    decimal CostPerUnit, decimal MinimumQuantity, string Supplier);
