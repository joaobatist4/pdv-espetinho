using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PdvEspetinho.QueryStack.Infrastructure;
using PdvEspetinho.QueryStack.Queries.Categories;
using PdvEspetinho.QueryStack.Queries.Dashboard;
using PdvEspetinho.QueryStack.Queries.Orders;
using PdvEspetinho.QueryStack.Queries.Products;
using PdvEspetinho.QueryStack.Queries.Stock;
using PdvEspetinho.QueryStack.Queries.SupplyCategories;
using PdvEspetinho.QueryStack.Queries.Tables;
using PdvEspetinho.QueryStack.Queries.Units;
using PdvEspetinho.QueryStack.Queries.Users;

namespace PdvEspetinho.QueryStack;

public static class DependencyInjection
{
    public static IServiceCollection AddQueryStack(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection not found.");

        services.AddSingleton(new QueryDb(connectionString));

        services.AddScoped<GetCategoriesQuery>();
        services.AddScoped<GetDashboardQuery>();
        services.AddScoped<GetTablesWithStatusQuery>();
        services.AddScoped<GetOpenOrdersQuery>();
        services.AddScoped<GetOrdersReportQuery>();
        services.AddScoped<GetProductsQuery>();
        services.AddScoped<GetStockQuery>();
        services.AddScoped<GetSupplyCategoriesQuery>();
        services.AddScoped<GetUnitsQuery>();
        services.AddScoped<GetUsersQuery>();

        return services;
    }
}
