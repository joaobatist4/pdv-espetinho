namespace PdvEspetinho.QueryStack.Queries.Dashboard;

public record DashboardDto(
    decimal Revenue,
    int OrderCount,
    decimal AvgTicket,
    decimal OpenRevenue,
    int OpenTableCount,
    int LowStockCount,
    List<TopProductDto> TopProducts,
    List<PaymentBreakdownDto> PaymentBreakdown,
    List<DailyChartDto> DailyChart);

public record TopProductDto(string ProductName, int TotalQty, decimal TotalRevenue, string Category);
public record PaymentBreakdownDto(string Method, decimal Total, decimal Percentage);
public record DailyChartDto(string Date, decimal Revenue, int OrderCount);
