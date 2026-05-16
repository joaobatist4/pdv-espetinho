using Dapper;
using PdvEspetinho.QueryStack.Infrastructure;

namespace PdvEspetinho.QueryStack.Queries.Stock;

public class GetStockQuery(QueryDb queryDb)
{
    public async Task<List<StockItemDto>> GetStockAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            @"SELECT si.product_id, p.name as product_name, c.slug as category_slug,
                     si.quantity, si.minimum_quantity
              FROM stock_items si
              JOIN products p ON p.id = si.product_id
              JOIN categories c ON c.id = p.category_id
              WHERE p.has_stock = true AND p.is_active = true
              ORDER BY p.name");

        return rows.Select(r => new StockItemDto(
            (Guid)r.product_id, (string)r.product_name, (string)r.category_slug,
            (int)r.quantity, (int)r.minimum_quantity,
            (int)r.quantity <= (int)r.minimum_quantity)).ToList();
    }

    public async Task<List<SupplyDto>> GetSuppliesAsync(CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            "SELECT id, name, category_slug, unit, cost_per_unit, quantity, minimum_quantity, supplier FROM supplies WHERE is_active = true ORDER BY name");

        return rows.Select(r => new SupplyDto(
            (Guid)r.id, (string)r.name, (string)r.category_slug,
            (string)r.unit, (decimal)r.cost_per_unit, (decimal)r.quantity,
            (decimal)r.minimum_quantity, (string)r.supplier,
            (decimal)r.quantity <= (decimal)r.minimum_quantity)).ToList();
    }

    public async Task<List<StockMovementDto>> GetProductMovementsAsync(Guid productId, CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            @"SELECT id, type, quantity_before, quantity_after, created_at
              FROM stock_movements
              WHERE product_id = @productId
              ORDER BY created_at DESC
              LIMIT 50",
            new { productId });

        return rows.Select(r => new StockMovementDto(
            (Guid)r.id, (string)r.type,
            (decimal)r.quantity_before, (decimal)r.quantity_after,
            (DateTime)r.created_at)).ToList();
    }

    public async Task<List<StockMovementDto>> GetSupplyMovementsAsync(Guid supplyId, CancellationToken ct = default)
    {
        await using var conn = queryDb.CreateConnection();
        await conn.OpenAsync(ct);

        var rows = await conn.QueryAsync(
            @"SELECT id, type, quantity_before, quantity_after, created_at
              FROM stock_movements
              WHERE supply_id = @supplyId
              ORDER BY created_at DESC
              LIMIT 50",
            new { supplyId });

        return rows.Select(r => new StockMovementDto(
            (Guid)r.id, (string)r.type,
            (decimal)r.quantity_before, (decimal)r.quantity_after,
            (DateTime)r.created_at)).ToList();
    }
}
