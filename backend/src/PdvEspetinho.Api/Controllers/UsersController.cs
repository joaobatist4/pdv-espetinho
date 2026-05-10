using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.Users.Commands.CreateUser;
using PdvEspetinho.Application.Features.Users.Commands.UpdateUser;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.QueryStack.Queries.Users;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(IMediator mediator, GetUsersQuery getUsersQuery, IUserRepository userRepository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var users = await getUsersQuery.ExecuteAsync(ct);
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/users/{result.Value}", new { id = result.Value });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { Id = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(id, ct);
        if (user is null) return NotFound();
        user.Toggle();
        await userRepository.UpdateAsync(user, ct);
        return NoContent();
    }
}
