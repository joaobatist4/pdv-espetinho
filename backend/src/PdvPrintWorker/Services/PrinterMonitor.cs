using System.Management;
using System.Runtime.Versioning;

namespace PdvPrintWorker.Services;

public enum PrinterStatus { Ok, LowPaper, NoPaper, DoorOpen, Jammed, Offline, Unknown }

public static class PrinterMonitor
{
    [SupportedOSPlatform("windows")]
    public static PrinterStatus GetStatus(string printerName)
    {
        try
        {
            var query = string.IsNullOrWhiteSpace(printerName)
                ? "SELECT * FROM Win32_Printer WHERE Default = TRUE"
                : $"SELECT * FROM Win32_Printer WHERE Name = '{printerName.Replace("'", "''")}'";

            using var searcher = new ManagementObjectSearcher(query);
            foreach (var obj in searcher.Get())
            {
                var errorState = (uint)obj["DetectedErrorState"];
                return errorState switch
                {
                    2 => PrinterStatus.Ok,
                    3 => PrinterStatus.LowPaper,
                    4 => PrinterStatus.NoPaper,
                    7 => PrinterStatus.DoorOpen,
                    8 => PrinterStatus.Jammed,
                    _ => PrinterStatus.Unknown
                };
            }
        }
        catch { }

        return PrinterStatus.Offline;
    }
}
