using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Mappings;

public class UnitMapping : IEntityTypeConfiguration<Unit>
{
    public void Configure(EntityTypeBuilder<Unit> builder)
    {
        builder.ToTable("units");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.CreatedAt).HasColumnName("created_at");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at");

        builder.Property(u => u.Name).HasColumnName("name").HasMaxLength(20).IsRequired();
        builder.Property(u => u.Label).HasColumnName("label").HasMaxLength(60).IsRequired();
        builder.Property(u => u.SortOrder).HasColumnName("sort_order");

        builder.HasIndex(u => u.Name).IsUnique();
    }
}
