using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Users.Commands.UpdateUser;

public class UpdateUserCommandHandler(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateUserCommand, Result>
{
    public async Task<Result> Handle(UpdateUserCommand request, CancellationToken ct)
    {
        var user = await userRepository.GetByIdAsync(request.Id, ct);
        if (user is null)
            return Result.Fail("Usuário não encontrado.");

        user.Update(request.Name, request.Email, request.Role, request.Permissions);
        if (!request.IsActive) user.Deactivate();
        else user.Activate();

        await userRepository.UpdateAsync(user, ct);
        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
