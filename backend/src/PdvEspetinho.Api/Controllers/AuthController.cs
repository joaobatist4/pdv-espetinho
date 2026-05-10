using MediatR;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.Auth.Commands.Login;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command, ct);
        if (result.IsFailed)
            return Unauthorized(new { errors = result.Errors.Select(e => e.Message) });

        return Ok(result.Value);
    }
}
