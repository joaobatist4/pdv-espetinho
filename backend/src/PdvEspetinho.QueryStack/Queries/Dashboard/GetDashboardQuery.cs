using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Dashboard;

public class GetDashboardQuery(QueryDb queryDb)
{
    public async Task<DashboardDto> ExecuteAsync(string period = "hoje", CancellationToken ct = default)
    {
        var (startDate, endDate) = GetDateRange(period);
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var revenue = await conn.QuerySingleAsync<decimal>(
            "SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE closed_at >= @start AND closed_at < @end",
            new { start = startDate, end = endDate });

        var orderCount = await conn.QuerySingleAsync<int>(
            "SELECT COUNT(*) FROM sales WHERE closed_at >= @start AND closed_at < @end",
            new { start = startDate, end = endDate });

        var openRevenue = await conn.QuerySingleAsync<decimal>(
            @"SELECT COALESCE(SUM(oi.unit_price * oi.quantity), 0)
              FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'Aberto'");

        var openTableCount = await conn.QuerySingleAsync<int>(
            "SELECT COUNT(*) FROM orders WHERE status = 'Aberto'");

        var lowStockCount = await conn.QuerySingleAsync<int>(
            "SELECT COUNT(*) FROM stock_items WHERE quantity <= minimum_quantity");

        var topProductsRaw = await conn.QueryAsync(
            @"SELECT oi.product_name, c.slug as category,
                     SUM(oi.quantity)::int as total_qty,
                     SUM(oi.unit_price * oi.quantity) as total_revenue
              FROM order_items oi
              JOIN orders o ON o.id = oi.order_id
              JOIN products p ON p.id = oi.product_id
              JOIN categories c ON c.id = p.category_id
              WHERE o.closed_at >= @start AND o.closed_at < @end
              GROUP BY oi.product_name, c.slug
              ORDER BY total_qty DESC LIMIT 10",
            new { start = startDate, end = endDate });

        var topProducts = topProductsRaw.Select(r => new TopProductDto(
            (string)r.product_name, (int)r.total_qty, (decimal)r.total_revenue, (string)r.category)).ToList();

        var paymentRaw = await conn.QueryAsync(
            @"SELECT sp.method, SUM(sp.amount) as total
              FROM sale_payments sp JOIN sales s ON s.id = sp.sale_id
              WHERE s.closed_at >= @start AND s.closed_at < @end
              GROUP BY sp.method",
            new { start = startDate, end = endDate });

        var paymentRows = paymentRaw.ToList();
        var totalPay = paymentRows.Sum(r => (decimal)r.total);
        var paymentBreakdown = paymentRows.Select(r => new PaymentBreakdownDto(
            (string)r.method, (decimal)r.total,
            totalPay > 0 ? Math.Round((decimal)r.total / totalPay * 100, 1) : 0)).ToList();

        var dailyChart = new List<DailyChartDto>();
        for (int i = 13; i >= 0; i--)
        {
            var day = DateTime.UtcNow.Date.AddDays(-i);
            var nextDay = day.AddDays(1);
            var dayRevenue = await conn.QuerySingleAsync<decimal>(
                "SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE closed_at >= @start AND closed_at < @end",
                new { start = day, end = nextDay });
            var dayCount = await conn.QuerySingleAsync<int>(
                "SELECT COUNT(*) FROM sales WHERE closed_at >= @start AND closed_at < @end",
                new { start = day, end = nextDay });
            dailyChart.Add(new DailyChartDto(day.ToString("dd/MM"), dayRevenue, dayCount));
        }

        return new DashboardDto(
            revenue, orderCount, orderCount > 0 ? revenue / orderCount : 0,
            openRevenue, openTableCount, lowStockCount,
            topProducts, paymentBreakdown, dailyChart);
    }

    private static (DateTime start, DateTime end) GetDateRange(string period) => period switch
    {
        "semana" => (DateTime.UtcNow.Date.AddDays(-7), DateTime.UtcNow.Date.AddDays(1)),
        "mes" => (DateTime.UtcNow.Date.AddDays(-30), DateTime.UtcNow.Date.AddDays(1)),
        _ => (DateTime.UtcNow.Date, DateTime.UtcNow.Date.AddDays(1))
    };
}
