using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Infra.Data.Mappings;

public class StockMovementMapping : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).HasColumnName("id");
        builder.Property(m => m.CreatedAt).HasColumnName("created_at");
        builder.Property(m => m.UpdatedAt).HasColumnName("updated_at");

        builder.Property(m => m.ProductId).HasColumnName("product_id");
        builder.Property(m => m.SupplyId).HasColumnName("supply_id");
        builder.Property(m => m.Type).HasColumnName("type").HasConversion<string>().IsRequired();
        builder.Property(m => m.QuantityBefore).HasColumnName("quantity_before").HasPrecision(10, 3);
        builder.Property(m => m.QuantityAfter).HasColumnName("quantity_after").HasPrecision(10, 3);
    }
}
