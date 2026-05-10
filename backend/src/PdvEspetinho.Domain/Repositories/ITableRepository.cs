using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Repositories;

public interface ITableRepository
{
    Task<Table?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Table>> GetAllActiveAsync(CancellationToken ct = default);
    Task AddAsync(Table table, CancellationToken ct = default);
    Task UpdateAsync(Table table, CancellationToken ct = default);
}
