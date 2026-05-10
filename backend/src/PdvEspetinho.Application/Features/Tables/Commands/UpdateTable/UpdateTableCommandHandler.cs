using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Tables.Commands.UpdateTable;

public class UpdateTableCommandHandler(ITableRepository tableRepository)
    : IRequestHandler<UpdateTableCommand, Result>
{
    public async Task<Result> Handle(UpdateTableCommand request, CancellationToken ct)
    {
        var table = await tableRepository.GetByIdAsync(request.Id, ct);
        if (table is null)
            return Result.Fail("Mesa não encontrada.");

        table.Update(request.Label, request.Type);
        if (!request.IsActive) table.Deactivate();

        await tableRepository.UpdateAsync(table, ct);
        return Result.Ok();
    }
}
