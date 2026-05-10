using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Categories.Commands.CreateCategory;

public record CreateCategoryCommand(string Name, string Slug, string Icon, int SortOrder) : IRequest<Result<Guid>>;
