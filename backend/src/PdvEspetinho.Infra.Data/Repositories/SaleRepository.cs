using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class SaleRepository(ApplicationContext context) : ISaleRepository
{
    public Task<Sale?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Sales.Include(s => s.Payments).FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task AddAsync(Sale sale, CancellationToken ct = default) =>
        await context.Sales.AddAsync(sale, ct);
}
