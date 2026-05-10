using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.SupplyCategories.Commands.CreateSupplyCategory;
using PdvEspetinho.Application.Features.SupplyCategories.Commands.UpdateSupplyCategory;
using PdvEspetinho.QueryStack.Queries.SupplyCategories;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/supply-categories")]
[Authorize]
public class SupplyCategoriesController(IMediator mediator, GetSupplyCategoriesQuery getSupplyCategoriesQuery) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var categories = await getSupplyCategoriesQuery.ExecuteAsync(ct);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSupplyCategoryCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/supply-categories/{result.Value}", new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplyCategoryCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }
}
