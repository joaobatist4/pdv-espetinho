using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PdvEspetinho.Application.Features.Orders.Commands.AddOrderItems;
using PdvEspetinho.Application.Features.Orders.Commands.AdjustOrderItemQuantity;
using PdvEspetinho.Application.Features.Orders.Commands.CancelOrder;
using PdvEspetinho.Application.Features.Orders.Commands.CloseOrder;
using PdvEspetinho.Application.Features.Orders.Commands.CreateOrder;
using PdvEspetinho.Application.Features.Orders.Commands.PrintBill;
using PdvEspetinho.Application.Features.Orders.Commands.RemoveOrderItem;
using PdvEspetinho.QueryStack.Queries.Orders;

namespace PdvEspetinho.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController(IMediator mediator, GetOpenOrdersQuery getOrdersQuery, GetOrdersReportQuery reportQuery) : ControllerBase
{
    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("report")]
    public async Task<IActionResult> GetReport([FromQuery] OrderReportRequest request, CancellationToken ct)
    {
        var result = await reportQuery.ExecuteAsync(
            request.Status, request.DateFrom, request.DateTo,
            request.Search, request.Page, request.PageSize, ct);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetOpenOrders(CancellationToken ct)
    {
        var orders = await getOrdersQuery.ExecuteAsync(ct);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var order = await getOrdersQuery.GetByOrderIdAsync(id, ct);
        if (order is null) return NotFound();
        return Ok(order);
    }

    [HttpGet("{id:guid}/kitchen-ticket")]
    public async Task<IActionResult> GetKitchenTicket(Guid id, CancellationToken ct)
    {
        var ticket = await getOrdersQuery.GetKitchenTicketAsync(id, ct);
        if (ticket is null) return NotFound();
        return Ok(ticket);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new CreateOrderCommand(request.TableId, CurrentUserId, request.EmployeeId), ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Created($"api/orders/{result.Value}", new { id = result.Value });
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItems(Guid id, [FromBody] AddOrderItemsCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { OrderId = id }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpPatch("{id:guid}/items/{itemId:guid}/quantity")]
    public async Task<IActionResult> AdjustItemQuantity(
        Guid id, Guid itemId, [FromBody] AdjustItemQuantityRequest request, CancellationToken ct)
    {
        var result = await mediator.Send(new AdjustOrderItemQuantityCommand(id, itemId, request.Delta), ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });
        return NoContent();
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId, CancellationToken ct)
    {
        var result = await mediator.Send(new RemoveOrderItemCommand(id, itemId), ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id, [FromBody] CloseOrderCommand command, CancellationToken ct)
    {
        var result = await mediator.Send(command with { OrderId = id, AttendantId = CurrentUserId }, ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return Ok(new { saleId = result.Value });
    }

    [HttpPost("{id:guid}/print-bill")]
    public async Task<IActionResult> PrintBill(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new PrintBillCommand(id), ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var result = await mediator.Send(new CancelOrderCommand(id), ct);
        if (result.IsFailed)
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });

        return NoContent();
    }
}

public record CreateOrderRequest(Guid TableId, Guid EmployeeId);
public record AdjustItemQuantityRequest(int Delta);
public record OrderReportRequest(
    string? Status, DateOnly? DateFrom, DateOnly? DateTo,
    string? Search, int Page = 1, int PageSize = 20);
