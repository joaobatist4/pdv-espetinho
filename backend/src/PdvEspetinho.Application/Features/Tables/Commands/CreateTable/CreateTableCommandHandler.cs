using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Tables.Commands.CreateTable;

public class CreateTableCommandHandler(
    ITableRepository tableRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateTableCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateTableCommand request, CancellationToken ct)
    {
        var table = Table.Create(request.Label, request.Type);
        await tableRepository.AddAsync(table, ct);
        await unitOfWork.CommitAsync(ct);
        return Result.Ok(table.Id);
    }
}
