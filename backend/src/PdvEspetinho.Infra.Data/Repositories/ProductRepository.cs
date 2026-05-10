using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class ProductRepository(ApplicationContext context) : IProductRepository
{
    public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IEnumerable<Product>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default) =>
        await context.Products.Where(p => ids.Contains(p.Id)).ToListAsync(ct);

    public async Task<IEnumerable<Product>> GetActiveByCategoryAsync(Guid categoryId, CancellationToken ct = default) =>
        await context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.CategoryId == categoryId)
            .ToListAsync(ct);

    public async Task<IEnumerable<Product>> GetAllActiveAsync(CancellationToken ct = default) =>
        await context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .ToListAsync(ct);

    public async Task AddAsync(Product product, CancellationToken ct = default) =>
        await context.Products.AddAsync(product, ct);

    public Task UpdateAsync(Product product, CancellationToken ct = default)
    {
        context.Products.Update(product);
        return Task.CompletedTask;
    }
}
