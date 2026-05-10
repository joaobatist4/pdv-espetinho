using PdvEspetinho.Domain.Common;

namespace PdvEspetinho.Domain.Entities;

public class Unit : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }

    private Unit() { }

    public static Unit Create(string name, string label, int sortOrder = 0) =>
        new() { Name = name, Label = label, SortOrder = sortOrder };

    public void Update(string name, string label, int sortOrder)
    {
        Name = name;
        Label = label;
        SortOrder = sortOrder;
        SetUpdatedAt();
    }
}
