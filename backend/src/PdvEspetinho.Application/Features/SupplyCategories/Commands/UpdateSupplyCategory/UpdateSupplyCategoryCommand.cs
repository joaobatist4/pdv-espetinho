using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.SupplyCategories.Commands.UpdateSupplyCategory;

public record UpdateSupplyCategoryCommand(Guid Id, string Name, string Icon, int SortOrder) : IRequest<Result>;
