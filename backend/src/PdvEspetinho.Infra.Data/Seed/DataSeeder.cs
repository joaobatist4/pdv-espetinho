using Microsoft.EntityFrameworkCore;
using PdvEspetinho.Domain.Entities;
using PdvEspetinho.Domain.Enums;
using PdvEspetinho.Infra.Data.Context;

namespace PdvEspetinho.Infra.Data.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationContext context)
    {
        await context.Database.MigrateAsync();

        if (await context.Users.AnyAsync())
            return;

        var admin = User.Create(
            name: "Administrador",
            email: "admin@espetim.com",
            passwordHash: BCrypt.Net.BCrypt.HashPassword("admin123"),
            role: Role.Admin,
            permissions: [
                Permission.Pdv, Permission.Pedidos, Permission.Estoque,
                Permission.EstoqueBebidas, Permission.Dashboard,
                Permission.Cadastro, Permission.Usuarios
            ]);

        var categories = new[]
        {
            Category.Create("Espetos",            "espetos",       "🍢", 1),
            Category.Create("Pratos",             "pratos",        "🍽️", 2),
            Category.Create("Guarnições",         "guarnicoes",    "🥗", 3),
            Category.Create("Bebidas Alcoólicas", "bebidas",       "🍺", 4),
            Category.Create("Bebidas N/A",        "nao_alcoolicas","🥤", 5),
        };

        var units = new[]
        {
            Unit.Create("un",  "Unidade",     1),
            Unit.Create("kg",  "Quilograma",  2),
            Unit.Create("g",   "Grama",       3),
            Unit.Create("L",   "Litro",       4),
            Unit.Create("ml",  "Mililitro",   5),
            Unit.Create("pct", "Pacote",      6),
            Unit.Create("cx",  "Caixa",       7),
        };

        var supplyCategories = new[]
        {
            SupplyCategory.Create("Carnes",       "carnes",        "🥩", 1),
            SupplyCategory.Create("Bebidas",       "bebidas",       "🍺", 2),
            SupplyCategory.Create("Temperos",      "temperos",      "🧂", 3),
            SupplyCategory.Create("Descartáveis",  "descartaveis",  "🧻", 4),
            SupplyCategory.Create("Outros",        "outros",        "📦", 5),
        };

        await context.Users.AddAsync(admin);
        await context.Categories.AddRangeAsync(categories);
        await context.Units.AddRangeAsync(units);
        await context.SupplyCategories.AddRangeAsync(supplyCategories);
        await context.SaveChangesAsync();
    }
}
