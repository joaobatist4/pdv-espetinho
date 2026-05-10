using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace PdvEspetinho.Infra.Services.Email;

public class EmailService(IConfiguration configuration) : IEmailService
{
    public async Task SendAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        var host = configuration["Email:Host"] ?? "localhost";
        var port = int.Parse(configuration["Email:Port"] ?? "587");
        var user = configuration["Email:User"] ?? string.Empty;
        var pass = configuration["Email:Password"] ?? string.Empty;
        var from = configuration["Email:From"] ?? "noreply@espetim.com";

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(from));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, cancellationToken: ct);
        if (!string.IsNullOrEmpty(user))
            await client.AuthenticateAsync(user, pass, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }
}
