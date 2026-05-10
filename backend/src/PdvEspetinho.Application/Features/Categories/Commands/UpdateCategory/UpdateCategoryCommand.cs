using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Categories.Commands.UpdateCategory;

public record UpdateCategoryCommand(Guid Id, string Name, string Icon, int SortOrder) : IRequest<Result>;
