using FluentResults;
using MediatR;
using PdvEspetinho.Application.Common.Interfaces;
using PdvEspetinho.Domain.Repositories;

namespace PdvEspetinho.Application.Features.Employees.Commands.UpdateEmployee;

public class UpdateEmployeeCommandHandler(
    IEmployeeRepository employeeRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateEmployeeCommand, Result>
{
    public async Task<Result> Handle(UpdateEmployeeCommand request, CancellationToken ct)
    {
        var employee = await employeeRepository.GetByIdAsync(request.Id, ct);
        if (employee is null)
            return Result.Fail("Funcionário não encontrado.");

        employee.Update(request.Name);
        await employeeRepository.UpdateAsync(employee, ct);
        await unitOfWork.CommitAsync(ct);
        return Result.Ok();
    }
}
