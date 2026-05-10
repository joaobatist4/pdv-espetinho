using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.Units.Commands.CreateUnit;
using PdvEspetinho.Application.Features.Units.Commands.UpdateUnit;
using PdvEspetinho.QueryStack.Queries.Units;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/units")]
[Authorize]
public class UnitsController(IMediator mediator, GetUnitsQuery getUnitsQuery) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var units = await getUnitsQuery.ExecuteAsync(ct);
        return Ok(units);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUnitCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/units/{result.Value}", new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUnitCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }
}
