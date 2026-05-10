using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Mappings;

public class SalePaymentMapping : IEntityTypeConfiguration<SalePayment>
{
    public void Configure(EntityTypeBuilder<SalePayment> builder)
    {
        builder.ToTable("sale_payments");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasColumnName("id");
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");

        builder.Property(p => p.SaleId).HasColumnName("sale_id").IsRequired();
        builder.Property(p => p.Method).HasColumnName("method").HasConversion<string>();
        builder.Property(p => p.Amount).HasColumnName("amount").HasPrecision(10, 2);
    }
}
