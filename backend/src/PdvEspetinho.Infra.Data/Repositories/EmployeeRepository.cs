using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Repositories;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Repositories;

public class EmployeeRepository(ApplicationContext context) : IEmployeeRepository
{
    public Task<Employee?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        context.Employees.FirstOrDefaultAsync(e => e.Id == id, ct);

    public Task<Employee?> GetByMatriculaAsync(string matricula, CancellationToken ct = default) =>
        context.Employees.FirstOrDefaultAsync(e => e.Matricula == matricula.ToUpper(), ct);

    public async Task AddAsync(Employee employee, CancellationToken ct = default) =>
        await context.Employees.AddAsync(employee, ct);

    public Task UpdateAsync(Employee employee, CancellationToken ct = default)
    {
        context.Employees.Update(employee);
        return Task.CompletedTask;
    }
}
