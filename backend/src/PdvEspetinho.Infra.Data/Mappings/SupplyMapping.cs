using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Mappings;

public class SupplyMapping : IEntityTypeConfiguration<Supply>
{
    public void Configure(EntityTypeBuilder<Supply> builder)
    {
        builder.ToTable("supplies");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.CreatedAt).HasColumnName("created_at");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at");

        builder.Property(s => s.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(s => s.CategorySlug).HasColumnName("category_slug").HasMaxLength(50);
        builder.Property(s => s.Unit).HasColumnName("unit").HasMaxLength(30);
        builder.Property(s => s.CostPerUnit).HasColumnName("cost_per_unit").HasPrecision(10, 2);
        builder.Property(s => s.Quantity).HasColumnName("quantity").HasPrecision(10, 3);
        builder.Property(s => s.MinimumQuantity).HasColumnName("minimum_quantity").HasPrecision(10, 3);
        builder.Property(s => s.Supplier).HasColumnName("supplier").HasMaxLength(150);
        builder.Property(s => s.IsActive).HasColumnName("is_active");
    }
}
