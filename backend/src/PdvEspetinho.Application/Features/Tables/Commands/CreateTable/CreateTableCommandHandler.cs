using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Tables.Commands.CreateTable;

public class CreateTableCommandHandler(ITableRepository tableRepository)
    : IRequestHandler<CreateTableCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateTableCommand request, CancellationToken ct)
    {
        var table = Table.Create(request.Label, request.Type);
        await tableRepository.AddAsync(table, ct);
        return Result.Ok(table.Id);
    }
}
