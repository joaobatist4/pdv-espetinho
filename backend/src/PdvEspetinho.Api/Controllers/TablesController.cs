using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Application.Features.Tables.Commands.CreateTable;
using PdvEspetinho.Application.Features.Tables.Commands.UpdateTable;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.QueryStack.Queries.Tables;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/tables")]
[Authorize]
public class TablesController(IMediator mediator, GetTablesWithStatusQuery getTablesQuery, ITableRepository tableRepository, IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, CancellationToken ct = default)
    {
        var tables = await getTablesQuery.ExecuteAsync(includeInactive, ct);
        return Ok(tables);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTableCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/tables/{result.Value}", new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTableCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    {
        var table = await tableRepository.GetByIdAsync(id, ct);
        if (table is null) return NotFound();
        table.Toggle();
        await tableRepository.UpdateAsync(table, ct);
        await unitOfWork.CommitAsync(ct);
        return NoContent();
    }
}
