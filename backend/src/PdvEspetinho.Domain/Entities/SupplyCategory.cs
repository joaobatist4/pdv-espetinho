using PdvEspetinho.Domain.Common;

namespace PdvEspetinho.Domain.Entities;

public class SupplyCategory : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string Icon { get; private set; } = string.Empty;
    public int SortOrder { get; private set; }

    private SupplyCategory() { }

    public static SupplyCategory Create(string name, string slug, string icon, int sortOrder = 0) =>
        new() { Name = name, Slug = slug, Icon = icon, SortOrder = sortOrder };

    public void Update(string name, string icon, int sortOrder)
    {
        Name = name;
        Icon = icon;
        SortOrder = sortOrder;
        SetUpdatedAt();
    }
}
