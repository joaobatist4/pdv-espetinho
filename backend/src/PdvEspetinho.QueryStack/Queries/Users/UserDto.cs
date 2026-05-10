namespace PdvEspetinho.QueryStack.Queries.Users;

public record UserDto(
    Guid Id,
    string Name,
    string Email,
    string Role,
    List<string> Permissions,
    bool IsActive,
    DateTime CreatedAt);
