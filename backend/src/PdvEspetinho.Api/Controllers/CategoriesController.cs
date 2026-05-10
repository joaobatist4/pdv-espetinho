using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.Categories.Commands.CreateCategory;
using PdvEspetinho.Application.Features.Categories.Commands.UpdateCategory;
using PdvEspetinho.QueryStack.Queries.Categories;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController(IMediator mediator, GetCategoriesQuery getCategoriesQuery) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var categories = await getCategoriesQuery.ExecuteAsync(ct);
        return Ok(categories);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/categories/{result.Value}", new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }
}
