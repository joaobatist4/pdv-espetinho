using PdvEspetinho.Domain.Common;

namespace PdvEspetinho.Domain.Entities;

public class Employee : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Matricula { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    private static readonly char[] MatriculaChars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".ToCharArray();

    private Employee() { }

    public static Employee Create(string name)
    {
        return new Employee
        {
            Name = name.Trim(),
            Matricula = GenerateMatricula(),
            IsActive = true,
        };
    }

    public void Update(string name)
    {
        Name = name.Trim();
        SetUpdatedAt();
    }

    public void Toggle()
    {
        IsActive = !IsActive;
        SetUpdatedAt();
    }

    private static string GenerateMatricula() =>
        new(Enumerable.Range(0, 5)
            .Select(_ => MatriculaChars[Random.Shared.Next(MatriculaChars.Length)])
            .ToArray());
}
