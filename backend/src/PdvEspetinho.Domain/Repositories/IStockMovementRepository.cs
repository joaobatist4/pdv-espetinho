using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Domain.Repositories;

public interface IStockMovementRepository
{
    Task AddAsync(StockMovement movement, CancellationToken ct = default);
}
