using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data;

public class UnitOfWork(ApplicationContext context) : IUnitOfWork
{
    public Task CommitAsync(CancellationToken ct = default) =>
        context.SaveChangesAsync(ct);
}
