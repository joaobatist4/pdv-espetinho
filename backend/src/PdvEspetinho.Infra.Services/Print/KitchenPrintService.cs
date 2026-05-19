using System.Drawing;
using System.Drawing.Printing;
using System.Runtime.Versioning;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace PdvEspetinho.Infra.Services.Print;

[SupportedOSPlatform("windows")]
public class KitchenPrintService(
    IOptions<KitchenPrintOptions> options,
    ILogger<KitchenPrintService> logger) : IKitchenPrintService
{
    private readonly KitchenPrintOptions _options = options.Value;

    public Task PrintAsync(string tableLabel, IEnumerable<KitchenPrintItem> items, string? employeeName = null, CancellationToken ct = default)
    {
        var kitchenItems = items.ToList();
        if (kitchenItems.Count == 0)
            return Task.CompletedTask;

        var printerName = ResolvePrinterName();
        if (printerName is null)
        {
            logger.LogWarning("Nenhuma impressora disponível no sistema. Comanda da cozinha não impressa.");
            return Task.CompletedTask;
        }

        try
        {
            using var doc = new PrintDocument();

            doc.PrinterSettings.PrinterName = printerName;

            // 80mm paper = 315 centésimos de polegada; margens mínimas para aproveitar a largura
            doc.DefaultPageSettings.PaperSize = new PaperSize("Receipt", 315, 2400);
            doc.DefaultPageSettings.Margins = new Margins(10, 10, 10, 10);

            var fontStyle = _options.Bold ? FontStyle.Bold : FontStyle.Regular;
            var lines = BuildLines(tableLabel, kitchenItems, _options.CharsPerLine, employeeName);
            var lineIndex = 0;

            doc.PrintPage += (_, e) =>
            {
                using var font = new Font("Courier New", _options.FontSize, fontStyle, GraphicsUnit.Point);
                var g = e.Graphics!;
                float y = e.MarginBounds.Top;
                float lineHeight = font.GetHeight(g) * 1.15f;

                while (lineIndex < lines.Count)
                {
                    if (y + lineHeight > e.MarginBounds.Bottom)
                    {
                        e.HasMorePages = true;
                        return;
                    }

                    g.DrawString(lines[lineIndex], font, Brushes.Black, e.MarginBounds.Left, y);
                    y += lineHeight;
                    lineIndex++;
                }

                e.HasMorePages = false;
            };

            doc.Print();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao imprimir comanda da cozinha para mesa '{TableLabel}'", tableLabel);
        }

        return Task.CompletedTask;
    }

    private string? ResolvePrinterName()
    {
        var installedPrinters = PrinterSettings.InstalledPrinters.Cast<string>().ToList();

        if (installedPrinters.Count == 0)
            return null;

        if (!string.IsNullOrWhiteSpace(_options.PrinterName))
        {
            var match = installedPrinters
                .FirstOrDefault(p => p.Equals(_options.PrinterName, StringComparison.OrdinalIgnoreCase));

            if (match is not null)
                return match;

            logger.LogWarning(
                "Impressora configurada '{PrinterName}' não encontrada. Impressoras disponíveis: {Available}",
                _options.PrinterName,
                string.Join(", ", installedPrinters));
        }

        var fallback = installedPrinters.First();
        logger.LogInformation("Usando impressora '{PrinterName}'.", fallback);
        return fallback;
    }

    private static List<string> BuildLines(string tableLabel, List<KitchenPrintItem> items, int charsPerLine, string? employeeName)
    {
        var now = DateTime.Now;
        var separator = new string('-', charsPerLine);

        var lines = new List<string>
        {
            separator,
            Center("ESPETINHO DO BIGODE", charsPerLine),
            Center("COMANDA COZINHA", charsPerLine)

        };

        if (!string.IsNullOrWhiteSpace(employeeName))
            lines.Add($"Atendente: {employeeName}");

        lines.Add($"MESA: {tableLabel}");
        lines.Add($"Hora: {now:HH:mm}  {now:dd/MM/yyyy}");
        lines.Add(separator);

        foreach (var item in items)
        {
            var prefix = $"{item.Quantity,2}x  ";
            lines.AddRange(WrapLine(prefix + item.ProductName, prefix.Length, charsPerLine));

            if (!string.IsNullOrWhiteSpace(item.Note))
            {
                var obsPrefix = "     Obs: ";
                lines.AddRange(WrapLine(obsPrefix + item.Note, obsPrefix.Length, charsPerLine));
            }
        }

        lines.Add(separator);
        lines.Add(string.Empty);

        return lines;
    }

    private static IEnumerable<string> WrapLine(string text, int indentOnWrap, int charsPerLine)
    {
        if (text.Length <= charsPerLine)
        {
            yield return text;
            yield break;
        }

        var indent = new string(' ', indentOnWrap);
        var remaining = text;

        while (remaining.Length > 0)
        {
            if (remaining.Length <= charsPerLine)
            {
                yield return remaining;
                yield break;
            }

            // Quebra na última palavra que cabe
            var breakAt = charsPerLine;
            var spaceIndex = remaining.LastIndexOf(' ', charsPerLine - 1);
            if (spaceIndex > indentOnWrap)
                breakAt = spaceIndex;

            yield return remaining[..breakAt].TrimEnd();
            remaining = indent + remaining[breakAt..].TrimStart();
        }
    }

    private static string Center(string text, int width) =>
        text.PadLeft((width + text.Length) / 2).PadRight(width);
}
