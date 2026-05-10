using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Mappings;

public class TableMapping : IEntityTypeConfiguration<Table>
{
    public void Configure(EntityTypeBuilder<Table> builder)
    {
        builder.ToTable("tables");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasColumnName("id");
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");

        builder.Property(t => t.Label).HasColumnName("label").HasMaxLength(50).IsRequired();
        builder.Property(t => t.Type).HasColumnName("type").HasConversion<string>();
        builder.Property(t => t.Status).HasColumnName("status").HasConversion<string>();
        builder.Property(t => t.IsActive).HasColumnName("is_active");
    }
}
