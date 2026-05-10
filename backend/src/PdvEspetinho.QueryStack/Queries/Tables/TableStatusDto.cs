namespace PdvEspetinho.QueryStack.Queries.Tables;

public record TableStatusDto(
    Guid Id,
    string Label,
    string Type,
    string Status,
    bool IsActive,
    Guid? CurrentOrderId,
    decimal CurrentTotal,
    int ItemCount,
    DateTime? OpenedAt);
