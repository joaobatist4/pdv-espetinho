using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;
using PdvEspetinho.Infra.Data.Repositories;

namespace PdvEspetinho.Infra.Data;

public static class DependencyInjection
{
    public static IServiceCollection AddInfraData(this IServiceCollection services, IConfiguration configuration, bool isDevelopment = false)
    {
        services.AddDbContext<ApplicationContext>(options =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
            if (isDevelopment)
                options.EnableSensitiveDataLogging();
        });

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ITableRepository, TableRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<ISaleRepository, SaleRepository>();
        services.AddScoped<IStockItemRepository, StockItemRepository>();
        services.AddScoped<IStockMovementRepository, StockMovementRepository>();
        services.AddScoped<ISupplyRepository, SupplyRepository>();
        services.AddScoped<IUnitRepository, UnitRepository>();
        services.AddScoped<ISupplyCategoryRepository, SupplyCategoryRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}
