using Microsoft.Extensions.DependencyInjection;
using PdvEspetinho.Infra.Services.Email;

namespace PdvEspetinho.Infra.Services;

public static class DependencyInjection
{
    public static IServiceCollection AddInfraServices(this IServiceCollection services)
    {
        services.AddScoped<IEmailService, EmailService>();
        return services;
    }
}
