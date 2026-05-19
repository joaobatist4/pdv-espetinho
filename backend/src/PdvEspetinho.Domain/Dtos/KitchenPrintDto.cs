namespace PdvEspetinho.Domain.Dtos;

public record KitchenPrintDto(string TableLabel, string? EmployeeName, List<KitchenPrintItemDto> Items);

public record KitchenPrintItemDto(string ProductName, int Quantity, string? Note);