using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Repositories;

public interface ISupplyCategoryRepository
{
    Task<SupplyCategory?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<SupplyCategory>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(SupplyCategory supplyCategory, CancellationToken ct = default);
    Task UpdateAsync(SupplyCategory supplyCategory, CancellationToken ct = default);
}
