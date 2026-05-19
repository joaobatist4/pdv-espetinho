using System.Runtime.Versioning;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Options;

namespace PdvPrintWorker.Services;

[SupportedOSPlatform("windows")]
public class SignalRWorkerService(
    ApiAuthService auth,
    PrintService printService,
    IOptions<WorkerOptions> options,
    ILogger<SignalRWorkerService> logger) : BackgroundService
{
    private readonly WorkerOptions _options = options.Value;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                await RunAsync(ct);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erro na conexão SignalR. Tentando novamente em 15s...");
                auth.Invalidate();
                await Task.Delay(TimeSpan.FromSeconds(15), ct);
            }
        }
    }

    private async Task RunAsync(CancellationToken ct)
    {
        var token = await auth.GetTokenAsync(ct);

        var connection = new HubConnectionBuilder()
            .WithUrl($"{_options.ApiUrl}/hubs/kitchen?access_token={token}")
            .WithAutomaticReconnect()
            .Build();

        connection.On<PrintJobDto>("NewOrder", async job =>
        {
            logger.LogInformation("Recebido pedido: mesa '{Table}', {Count} item(ns).", job.TableLabel, job.Items.Count);
            await printService.PrintAsync(job);
        });

        connection.On<BillPrintDto>("PrintBill", async bill =>
        {
            logger.LogInformation("Recebida conta: mesa '{Table}', {Count} item(ns).", bill.TableLabel, bill.Items.Count);
            await printService.PrintBillAsync(bill);
        });

        connection.Reconnecting += error =>
        {
            logger.LogWarning("Reconectando ao hub... {Error}", error?.Message);
            auth.Invalidate();
            return Task.CompletedTask;
        };

        connection.Reconnected += _ =>
        {
            logger.LogInformation("Reconectado ao hub.");
            return Task.CompletedTask;
        };

        await connection.StartAsync(ct);
        logger.LogInformation("Conectado ao hub SignalR em {Url}.", _options.ApiUrl);

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        while (await timer.WaitForNextTickAsync(ct))
        {
            if (connection.State != HubConnectionState.Connected) continue;

            var status = PrinterMonitor.GetStatus(_options.PrinterName);
            if (status != PrinterStatus.Ok)
            {
                logger.LogWarning("Status da impressora: {Status}", status);
                await connection.InvokeAsync("ReportPrinterStatus", status.ToString(), ct);
            }
        }

        await connection.StopAsync(ct);
    }
}
