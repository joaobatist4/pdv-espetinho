using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Mappings;

public class SupplyCategoryMapping : IEntityTypeConfiguration<SupplyCategory>
{
    public void Configure(EntityTypeBuilder<SupplyCategory> builder)
    {
        builder.ToTable("supply_categories");

        builder.HasKey(sc => sc.Id);
        builder.Property(sc => sc.Id).HasColumnName("id");
        builder.Property(sc => sc.CreatedAt).HasColumnName("created_at");
        builder.Property(sc => sc.UpdatedAt).HasColumnName("updated_at");

        builder.Property(sc => sc.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(sc => sc.Slug).HasColumnName("slug").HasMaxLength(50).IsRequired();
        builder.Property(sc => sc.Icon).HasColumnName("icon").HasMaxLength(10);
        builder.Property(sc => sc.SortOrder).HasColumnName("sort_order");

        builder.HasIndex(sc => sc.Slug).IsUnique();
    }
}
