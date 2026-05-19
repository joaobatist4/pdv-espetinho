using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler(
    IOrderRepository orderRepository,
    ITableRepository tableRepository,
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateOrderCommand, Result<Guid>>
{
    public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        var table = await tableRepository.GetByIdAsync(request.TableId, ct);
        if (table is null || !table.IsActive)
            return Result.Fail<Guid>("Mesa não encontrada.");

        var employee = await employeeRepository.GetByIdAsync(request.EmployeeId, ct);
        if (employee is null || !employee.IsActive)
            return Result.Fail<Guid>("Funcionário não encontrado ou inativo.");

        var existing = await orderRepository.GetOpenByTableAsync(request.TableId, ct);
        if (existing is not null)
            return Result.Ok(existing.Id);

        var order = Order.Create(request.TableId, request.AttendantId, request.EmployeeId);
        await orderRepository.AddAsync(order, ct);

        await unitOfWork.CommitAsync(ct);
        return Result.Ok(order.Id);
    }
}
