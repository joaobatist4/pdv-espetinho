using PdvEspetinho.Domain.Common;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Domain.Entities;

public class Table : Entity
{
    public string Label { get; private set; } = string.Empty;
    public TableType Type { get; private set; }
    public TableStatus Status { get; private set; }
    public bool IsActive { get; private set; }

    private Table() { }

    public static Table Create(string label, TableType type)
    {
        return new Table
        {
            Label = label,
            Type = type,
            Status = TableStatus.Livre,
            IsActive = true
        };
    }

    public void Update(string label, TableType type)
    {
        Label = label;
        Type = type;
        SetUpdatedAt();
    }

    public void SetStatus(TableStatus status)
    {
        Status = status;
        SetUpdatedAt();
    }

    public void Deactivate()
    {
        IsActive = false;
        SetUpdatedAt();
    }

    public void Activate()
    {
        IsActive = true;
        SetUpdatedAt();
    }

    public void Toggle()
    {
        if (IsActive) Deactivate(); else Activate();
    }
}
