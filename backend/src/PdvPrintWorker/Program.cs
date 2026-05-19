using System.Globalization;
using PdvPrintWorker;
using PdvPrintWorker.Services;

CultureInfo.DefaultThreadCurrentCulture = CultureInfo.GetCultureInfo("pt-BR");
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.GetCultureInfo("pt-BR");

var host = Host.CreateDefaultBuilder(args)
    .UseWindowsService(o => o.ServiceName = "PDV-PrintWorker")
    .ConfigureServices((ctx, services) =>
    {
        services.Configure<WorkerOptions>(ctx.Configuration.GetSection("Worker"));
        services.AddHttpClient<ApiAuthService>();
        services.AddSingleton<PrintService>();
        services.AddHostedService<SignalRWorkerService>();
    })
    .Build();

await host.RunAsync();
