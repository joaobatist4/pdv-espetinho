using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<LoginResult>>;

public record LoginResult(string Token, Guid UserId, string UserName, string Role, List<string> Permissions);
