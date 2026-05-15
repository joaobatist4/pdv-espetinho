using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class StockMovementRepository(ApplicationContext context) : IStockMovementRepository
{
    public async Task AddAsync(StockMovement movement, CancellationToken ct = default) =>
        await context.StockMovements.AddAsync(movement, ct);
}
