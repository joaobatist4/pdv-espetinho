namespace PdvEspetinho.Infra.Services.Email;

public interface IEmailService
{
    Task SendAsync(string to, string subject, string body, CancellationToken ct = default);
}
