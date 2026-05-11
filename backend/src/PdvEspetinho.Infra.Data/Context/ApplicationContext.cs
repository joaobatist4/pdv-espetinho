using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ValueGeneration;
using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Context;

public class ApplicationContext(DbContextOptions<ApplicationContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Table> Tables => Set<Table>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SalePayment> SalePayments => Set<SalePayment>();
    public DbSet<StockItem> StockItems => Set<StockItem>();
    public DbSet<Supply> Supplies => Set<Supply>();
    public DbSet<Unit> Units => Set<Unit>();
    public DbSet<SupplyCategory> SupplyCategories => Set<SupplyCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
         modelBuilder.Model.GetEntityTypes()
        .Where(t => typeof(Entity).IsAssignableFrom(t.ClrType))
        .ToList()
        .ForEach(t => modelBuilder.Entity(t.ClrType)
            .Property(nameof(Entity.Id))
            .HasValueGenerator<SequentialGuidValueGenerator>()
            .ValueGeneratedNever());

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
