using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Repositories;

public interface ISaleRepository
{
    Task<Sale?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Sale sale, CancellationToken ct = default);
}
