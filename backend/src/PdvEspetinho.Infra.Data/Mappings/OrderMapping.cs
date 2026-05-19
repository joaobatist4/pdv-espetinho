using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;

namespace PdvEspetinho.Infra.Data.Mappings;

public class OrderMapping : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id).HasColumnName("id");
        builder.Property(o => o.CreatedAt).HasColumnName("created_at");
        builder.Property(o => o.UpdatedAt).HasColumnName("updated_at");

        builder.Property(o => o.TableId).HasColumnName("table_id").IsRequired();
        builder.Property(o => o.AttendantId).HasColumnName("attendant_id").IsRequired();
        builder.Property(o => o.EmployeeId).HasColumnName("employee_id");
        builder.Property(o => o.Status).HasColumnName("status").HasConversion<string>();
        builder.Property(o => o.OpenedAt).HasColumnName("opened_at");
        builder.Property(o => o.ClosedAt).HasColumnName("closed_at");

        builder.HasMany(o => o.Items)
            .WithOne()
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(o => o.DomainEvents);
    }
}
