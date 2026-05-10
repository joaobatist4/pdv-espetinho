using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Infra.Data.Mappings;

public class UserMapping : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasColumnName("id");
        builder.Property(u => u.CreatedAt).HasColumnName("created_at");
        builder.Property(u => u.UpdatedAt).HasColumnName("updated_at");

        builder.Property(u => u.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
        builder.Property(u => u.Email).HasColumnName("email").HasMaxLength(200).IsRequired();
        builder.Property(u => u.PasswordHash).HasColumnName("password_hash").IsRequired();
        builder.Property(u => u.Role).HasColumnName("role").HasConversion<string>();
        builder.Property(u => u.IsActive).HasColumnName("is_active");

        var permissionsComparer = new ValueComparer<List<Permission>>(
            (a, b) => a != null && b != null && a.SequenceEqual(b),
            v => v.Aggregate(0, (h, p) => HashCode.Combine(h, p.GetHashCode())),
            v => v.ToList());

        builder.Property(u => u.Permissions)
            .HasColumnName("permissions")
            .HasConversion(
                v => string.Join(',', v.Select(p => p.ToString())),
                v => string.IsNullOrEmpty(v)
                    ? new List<Permission>()
                    : v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                       .Select(Enum.Parse<Permission>)
                       .ToList()
            )
            .Metadata.SetValueComparer(permissionsComparer);

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
