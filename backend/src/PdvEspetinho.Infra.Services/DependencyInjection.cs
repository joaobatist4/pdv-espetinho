using Microsoft.Extensions.DependencyInjection;
using PdvEspetinho.Infra.Services.Email;
using PdvEspetinho.Infra.Services.Print;

namespace PdvEspetinho.Infra.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddInfraServices(this IServiceCollection services)
    {
        services.AddScoped<IEmailService, EmailService>();

#pragma warning disable CA1416
        services.AddScoped<IKitchenPrintService, KitchenPrintService>();
#pragma warning restore CA1416

        return services;
    }
}
