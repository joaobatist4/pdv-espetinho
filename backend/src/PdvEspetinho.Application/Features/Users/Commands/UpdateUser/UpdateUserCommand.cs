using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Users.Commands.UpdateUser;

public record UpdateUserCommand(
    Guid Id,
    string Name,
    string Email,
    Role Role,
    List<Permission> Permissions,
    bool IsActive) : IRequest<Result>;
