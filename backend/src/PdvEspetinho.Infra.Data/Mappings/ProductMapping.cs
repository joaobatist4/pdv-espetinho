using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Mappings;

public class ProductMapping : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");

        builder.Property(p => p.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
        builder.Property(p => p.CategoryId).HasColumnName("category_id").IsRequired();
        builder.Property(p => p.Subcategory).HasColumnName("subcategory").HasMaxLength(100);
        builder.Property(p => p.Price).HasColumnName("price").HasPrecision(10, 2);
        builder.Property(p => p.Unit).HasColumnName("unit").HasMaxLength(30);
        builder.Property(p => p.GoesToKitchen).HasColumnName("goes_to_kitchen");
        builder.Property(p => p.HasStock).HasColumnName("has_stock");
        builder.Property(p => p.IsActive).HasColumnName("is_active");

        builder.HasOne(p => p.Category)
            .WithMany()
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
