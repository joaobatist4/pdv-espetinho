namespace PdvEspetinho.Infra.Services.Print;

public class KitchenPrintOptions
{
    public string PrinterName { get; set; } = string.Empty;
    public float FontSize { get; set; } = 10f;
    public bool Bold { get; set; } = true;
    public int CharsPerLine { get; set; } = 34;
}
