namespace PdvEspetinho.QueryStack.Queries.Orders;

public record OrderReportItemDto(
    Guid Id,
    string TableLabel,
    string AttendantName,
    string Status,
    DateTime OpenedAt,
    DateTime? ClosedAt,
    decimal Total,
    int ItemCount,
    string ItemsSummary);

public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);
