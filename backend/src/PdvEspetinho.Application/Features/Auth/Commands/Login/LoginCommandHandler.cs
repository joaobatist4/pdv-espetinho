using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler(IUserRepository userRepository, IJwtService jwtService)
    : IRequestHandler<LoginCommand, Result<LoginResult>>
{
    public async Task<Result<LoginResult>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await userRepository.GetByEmailAsync(request.Email, ct);
        if (user is null || !user.IsActive)
            return Result.Fail<LoginResult>("Credenciais inválidas.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Result.Fail<LoginResult>("Credenciais inválidas.");

        var token = jwtService.GenerateToken(user);
        var permissions = user.Permissions.Select(p => p.ToString()).ToList();

        return Result.Ok(new LoginResult(token, user.Id, user.Name, user.Role.ToString(), permissions));
    }
}
