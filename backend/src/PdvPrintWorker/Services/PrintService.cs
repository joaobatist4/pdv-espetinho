using System.Drawing;
using System.Drawing.Printing;
using System.Runtime.Versioning;
using Microsoft.Extensions.Options;

namespace PdvPrintWorker.Services;

[SupportedOSPlatform("windows")]
public class PrintService(IOptions<WorkerOptions> options, ILogger<PrintService> logger)
{
    private readonly WorkerOptions _options = options.Value;
    private const int Cols = 30;
    private const float FontSize = 10f;
    private const float LineSpacing = 1.05f;

    // Fator generoso para cálculo da altura do papel — evita corte das últimas linhas
    private static int PaperHeight(int lineCount) =>
        (int)Math.Ceiling(lineCount * (FontSize / 72.0 * 100.0 * 1.4)) + 40;

    public Task PrintAsync(PrintJobDto job)
    {
        var lines = BuildLines(job);
        var printerName = ResolvePrinterName();

        if (printerName is null)
        {
            logger.LogWarning("Nenhuma impressora disponível. Comanda não impressa para mesa '{Table}'.", job.TableLabel);
            return Task.CompletedTask;
        }

        try
        {
            using var doc = new PrintDocument();
            doc.PrinterSettings.PrinterName = printerName;

            // Calcula altura exata: linhas * altura estimada por linha + margens
            // 10pt a 100 dpi (unidades do PrintDocument = centésimos de polegada)
            // 10pt = 10/72 pol ≈ 13.9 centésimos; com LineSpacing ≈ 15 centésimos por linha
            doc.DefaultPageSettings.PaperSize = new PaperSize("Receipt", 315, PaperHeight(lines.Count));
            doc.DefaultPageSettings.Margins = new Margins(10, 10, 5, 5);

            var lineIndex = 0;
            doc.PrintPage += (_, e) =>
            {
                using var font = new Font("Courier New", FontSize, FontStyle.Bold, GraphicsUnit.Point);
                var g = e.Graphics!;
                float y = e.MarginBounds.Top;
                float lineHeight = font.GetHeight(g) * LineSpacing;

                while (lineIndex < lines.Count)
                {
                    g.DrawString(lines[lineIndex], font, Brushes.Black, e.MarginBounds.Left, y);
                    y += lineHeight;
                    lineIndex++;
                }
                e.HasMorePages = false;
            };

            doc.Print();
            logger.LogInformation("Comanda impressa: mesa '{Table}', {Count} item(ns).", job.TableLabel, job.Items.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao imprimir comanda para mesa '{Table}'.", job.TableLabel);
        }

        return Task.CompletedTask;
    }

    public Task PrintBillAsync(BillPrintDto bill)
    {
        var lines = BuildBillLines(bill);
        var printerName = ResolvePrinterName();

        if (printerName is null)
        {
            logger.LogWarning("Nenhuma impressora disponível. Conta não impressa para mesa '{Table}'.", bill.TableLabel);
            return Task.CompletedTask;
        }

        try
        {
            using var doc = new PrintDocument();
            doc.PrinterSettings.PrinterName = printerName;

            doc.DefaultPageSettings.PaperSize = new PaperSize("Receipt", 315, PaperHeight(lines.Count));
            doc.DefaultPageSettings.Margins = new Margins(10, 10, 5, 5);

            var lineIndex = 0;
            doc.PrintPage += (_, e) =>
            {
                using var font = new Font("Courier New", FontSize, FontStyle.Bold, GraphicsUnit.Point);
                var g = e.Graphics!;
                float y = e.MarginBounds.Top;
                float lineHeight = font.GetHeight(g) * LineSpacing;

                while (lineIndex < lines.Count)
                {
                    g.DrawString(lines[lineIndex], font, Brushes.Black, e.MarginBounds.Left, y);
                    y += lineHeight;
                    lineIndex++;
                }
                e.HasMorePages = false;
            };

            doc.Print();
            logger.LogInformation("Conta impressa: mesa '{Table}'.", bill.TableLabel);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao imprimir conta para mesa '{Table}'.", bill.TableLabel);
        }

        return Task.CompletedTask;
    }

    private static List<string> BuildBillLines(BillPrintDto bill)
    {
        var sep = new string('-', Cols);
        var lines = new List<string>
        {
            sep,
            Center("ESPETINHO DO BIGODE"),
            Center("A CONTA"),
            sep,
            $"Mesa: {bill.TableLabel}   {bill.PrintedAt:dd/MM} {bill.PrintedAt:HH:mm}",
        };

        if (!string.IsNullOrWhiteSpace(bill.EmployeeName))
            lines.Add($"Atend.: {bill.EmployeeName}");

        lines.Add(sep);

        foreach (var item in bill.Items)
        {
            // linha do nome com quantidade
            var prefix = $"{item.Quantity,2}x  ";
            var nameLine = prefix + item.ProductName;
            if (nameLine.Length <= Cols)
                lines.Add(nameLine);
            else
                lines.AddRange(WrapLine(nameLine, prefix.Length));

            // preço unitário e total do item
            var unitStr = $"R$ {item.UnitPrice:F2}";
            var totalStr = $"R$ {item.ItemTotal:F2}";
            var priceLine = unitStr.PadLeft(Cols / 2) + totalStr.PadLeft(Cols - Cols / 2);
            lines.Add(priceLine);
        }

        lines.Add(sep);
        var totalLabel = "TOTAL:";
        var totalValue = $"R$ {bill.Total:F2}";
        lines.Add(totalLabel + totalValue.PadLeft(Cols - totalLabel.Length));
        lines.Add(sep);
        lines.Add(Center("NÃO É DOCUMENTO FISCAL"));
        lines.Add(sep);
        lines.Add(Center("Obrigado pela preferência!"));
        lines.Add(Center("@oespetinhodobigode"));
        lines.Add(sep);

        return lines;
    }

    private string? ResolvePrinterName()
    {
        var installed = PrinterSettings.InstalledPrinters.Cast<string>().ToList();
        if (installed.Count == 0) return null;

        if (!string.IsNullOrWhiteSpace(_options.PrinterName))
        {
            var match = installed.FirstOrDefault(p =>
                p.Equals(_options.PrinterName, StringComparison.OrdinalIgnoreCase));

            if (match is not null) return match;

            logger.LogWarning(
                "Impressora '{Name}' não encontrada. Disponíveis: {List}",
                _options.PrinterName, string.Join(", ", installed));
        }

        return installed.First();
    }

    private static List<string> BuildLines(PrintJobDto job)
    {
        var now = DateTime.Now;
        var sep = new string('-', Cols);
        var lines = new List<string>
        {
            sep,
            Center("ESPETINHO DO BIGODE"),
            Center("COMANDA COZINHA"),
            $"MESA: {job.TableLabel}   {now:HH:mm} {now:dd/MM}",
        };

        if (!string.IsNullOrWhiteSpace(job.EmployeeName))
            lines.Add($"Atend.: {job.EmployeeName}");

        lines.Add(sep);

        foreach (var item in job.Items)
        {
            var prefix = $"{item.Quantity,2}x  ";
            lines.AddRange(WrapLine(prefix + item.ProductName, prefix.Length));

            if (!string.IsNullOrWhiteSpace(item.Note))
            {
                var obsPrefix = "     Obs: ";
                lines.AddRange(WrapLine(obsPrefix + item.Note, obsPrefix.Length));
            }
        }

        lines.Add(sep);
        return lines;
    }

    private static IEnumerable<string> WrapLine(string text, int indentLen)
    {
        if (text.Length <= Cols) { yield return text; yield break; }
        var indent = new string(' ', indentLen);
        var remaining = text;
        while (remaining.Length > 0)
        {
            if (remaining.Length <= Cols) { yield return remaining; yield break; }
            var breakAt = Cols;
            var spaceIdx = remaining.LastIndexOf(' ', Cols - 1);
            if (spaceIdx > indentLen) breakAt = spaceIdx;
            yield return remaining[..breakAt].TrimEnd();
            remaining = indent + remaining[breakAt..].TrimStart();
        }
    }

    private static string Center(string text) =>
        text.PadLeft((Cols + text.Length) / 2).PadRight(Cols);
}
