using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.SupplyCategories.Commands.CreateSupplyCategory;

public record CreateSupplyCategoryCommand(string Name, string Slug, string Icon, int SortOrder) : IRequest<Result<Guid>>;
