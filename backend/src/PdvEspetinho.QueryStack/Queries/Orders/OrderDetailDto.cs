namespace PdvEspetinho.QueryStack.Queries.Orders;

public record OrderDetailDto(
    Guid Id,
    Guid TableId,
    string TableLabel,
    string AttendantName,
    string Status,
    DateTime OpenedAt,
    DateTime? ClosedAt,
    decimal Total,
    List<OrderItemDetailDto> Items,
    List<OrderPaymentDto> Payments);

public record OrderPaymentDto(string Method, decimal Amount);

public record OrderItemDetailDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    decimal UnitPrice,
    int Quantity,
    bool GoesToKitchen,
    string Status,
    decimal Total);

public record KitchenTicketDto(
    Guid OrderId,
    string TableLabel,
    DateTime OpenedAt,
    List<KitchenItemDto> Items);

public record KitchenItemDto(string ProductName, int Quantity);
