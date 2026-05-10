using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Repositories;

public interface IUnitRepository
{
    Task<Unit?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Unit>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(Unit unit, CancellationToken ct = default);
    Task UpdateAsync(Unit unit, CancellationToken ct = default);
}
