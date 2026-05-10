using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand(
    string Name,
    string Email,
    string Password,
    Role Role,
    List<Permission> Permissions) : IRequest<Result<Guid>>;
