namespace PdvEspetinho.Application.Common.Interfaces;

public interface IUnitOfWork
{
    Task CommitAsync(CancellationToken ct = default);
}
