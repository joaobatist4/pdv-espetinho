using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Entities;

public class User : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public Role Role { get; private set; }
    public List<Permission> Permissions { get; private set; } = [];
    public bool IsActive { get; private set; }

    private User() { }

    public static User Create(string name, string email, string passwordHash, Role role, List<Permission> permissions)
    {
        return new User
        {
            Name = name,
            Email = email.ToLowerInvariant(),
            PasswordHash = passwordHash,
            Role = role,
            Permissions = permissions,
            IsActive = true
        };
    }

    public void Update(string name, string email, Role role, List<Permission> permissions)
    {
        Name = name;
        Email = email.ToLowerInvariant();
        Role = role;
        Permissions = permissions;
        SetUpdatedAt();
    }

    public void ChangePassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void Toggle()
    {
        if (IsActive) Deactivate(); else Activate();
    }

    public bool HasPermission(Permission permission) =>
        Role == Role.Admin || Permissions.Contains(permission);
}
