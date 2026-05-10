using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Repositories;

public interface ISupplyRepository
{
    Task<Supply?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Supply>> GetAllActiveAsync(CancellationToken ct = default);
    Task AddAsync(Supply supply, CancellationToken ct = default);
    Task UpdateAsync(Supply supply, CancellationToken ct = default);
}
