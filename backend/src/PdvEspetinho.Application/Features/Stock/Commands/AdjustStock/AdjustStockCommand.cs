using FluentResults;
using MediatR;
using PdvEspetinho.Domain.Enums;

namespace PdvEspetinho.Application.Features.Stock.Commands.AdjustStock;

public record AdjustStockCommand(Guid ProductId, int Delta, MovementType Type, int? NewMinimum = null) : IRequest<Result>;
