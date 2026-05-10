using FluentResults;
using MediatR;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustStock;

public record AdjustStockCommand(Guid ProductId, int Delta, int? NewMinimum = null) : IRequest<Result>;
