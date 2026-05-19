using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Application.Features.Employees.Commands.CreateEmployee;
using PdvEspetinho.Application.Features.Employees.Commands.UpdateEmployee;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.QueryStack.Queries.Employees;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/employees")]
[Authorize]
public class EmployeesController(
    IMediator mediator,
    GetEmployeesQuery getEmployeesQuery,
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var employees = await getEmployeesQuery.ExecuteAsync(ct);
        return Ok(employees);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/employees/{result.Value}", new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEmployeeCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    {
        var employee = await employeeRepository.GetByIdAsync(id, ct);
        if (employee is null) return NotFound();
        employee.Toggle();
        await employeeRepository.UpdateAsync(employee, ct);
        await unitOfWork.CommitAsync(ct);
        return NoContent();
    }
}
