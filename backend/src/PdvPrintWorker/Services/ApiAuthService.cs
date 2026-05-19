using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace PdvPrintWorker.Services;

public class ApiAuthService(HttpClient http, IOptions<WorkerOptions> options, ILogger<ApiAuthService> logger)
{
    private readonly WorkerOptions _options = options.Value;
    private string? _token;
    private DateTime _expiresAt = DateTime.MinValue;

    public async Task<string> GetTokenAsync(CancellationToken ct = default)
    {
        if (_token is not null && DateTime.UtcNow < _expiresAt.AddMinutes(-5))
            return _token;

        logger.LogInformation("Autenticando com o backend...");

        var response = await http.PostAsJsonAsync(
            $"{_options.ApiUrl}/api/auth/login",
            new { email = _options.Email, password = _options.Password },
            ct);

        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        _token = body.GetProperty("token").GetString()
            ?? throw new InvalidOperationException("Token não retornado pelo backend.");

        _expiresAt = DateTime.UtcNow.AddHours(12);
        logger.LogInformation("Autenticado com sucesso.");
        return _token;
    }

    public void Invalidate() => _token = null;
}
